import { NextResponse } from "next/server";
import { BigQuery } from "@google-cloud/bigquery";
import * as fs from "fs/promises";
import * as path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SERVICE_ACCOUNT_FILE = "dashboards-384718-e9fed61503a8 (1).json";
const QUERY_FILE = "modelo-de-consulta.txt";
const OUTPUT_FILE = "bigquery-result.txt";

async function fileExists(filePath: string) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function findFileUpwards(fileName: string) {
    let currentDir = process.cwd();

    while (true) {
        const directPath = path.join(currentDir, fileName);
        if (await fileExists(directPath)) {
            return directPath;
        }

        const secretsPath = path.join(currentDir, "secrets", fileName);
        if (await fileExists(secretsPath)) {
            return secretsPath;
        }

        const parentDir = path.dirname(currentDir);

        if (parentDir === currentDir) {
            throw new Error(
                `Could not find ${fileName}. Put it in the repo root or in a secrets/ folder.`,
            );
        }

        currentDir = parentDir;
    }
}

function getReferencedTableFromQuery(query: string) {
    const match = query.match(/FROM\s+`([^`]+)`/i);

    if (!match?.[1]) {
        throw new Error("Could not find a BigQuery table reference in the SQL file.");
    }

    const [projectId, datasetId, tableId] = match[1].split(".");

    if (!projectId || !datasetId || !tableId) {
        throw new Error(`Invalid BigQuery table reference: ${match[1]}`);
    }

    return {
        projectId,
        datasetId,
        tableId,
        fullTableId: match[1],
    };
}

function normalizeBigQueryValue(value: unknown): unknown {
    if (
        value &&
        typeof value === "object" &&
        "value" in value &&
        Object.keys(value).length === 1
    ) {
        return (value as { value: unknown }).value;
    }

    return value;
}

function normalizeRow(row: Record<string, unknown>) {
    return Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
            key,
            normalizeBigQueryValue(value),
        ]),
    );
}

export async function GET() {
    try {
        const serviceAccountPath = await findFileUpwards(SERVICE_ACCOUNT_FILE);
        const queryPath = await findFileUpwards(QUERY_FILE);

        const credentialsRaw = await fs.readFile(serviceAccountPath, "utf8");
        const credentials = JSON.parse(credentialsRaw);

        const query = await fs.readFile(queryPath, "utf8");

        const referencedTable = getReferencedTableFromQuery(query);

        const bigquery = new BigQuery({
            projectId: credentials.project_id,
            credentials,
        });

        const [datasetMetadata] = await bigquery
            .dataset(referencedTable.datasetId)
            .getMetadata();

        const location = datasetMetadata.location;

        if (!location) {
            throw new Error(
                `Could not detect location for dataset ${referencedTable.projectId}:${referencedTable.datasetId}`,
            );
        }

        const [rows] = await bigquery.query({
            query,
            location,
        });

        const normalizedRows = rows.map((row) =>
            normalizeRow(row as Record<string, unknown>),
        );

        const repoRoot = path.resolve(process.cwd(), "../..");
        const outputPath = path.join(repoRoot, OUTPUT_FILE);

        await fs.writeFile(
            outputPath,
            JSON.stringify(
                {
                    ok: true,
                    generatedAt: new Date().toISOString(),
                    source: {
                        serviceAccountPath,
                        queryPath,
                        outputPath,
                        projectId: credentials.project_id,
                        table: referencedTable.fullTableId,
                        dataset: `${referencedTable.projectId}:${referencedTable.datasetId}`,
                        location,
                    },
                    rows: normalizedRows,
                },
                null,
                2,
            ),
            "utf8",
        );

        return NextResponse.json({
            ok: true,
            rows: normalizedRows.length,
            location,
            table: referencedTable.fullTableId,
            savedTo: outputPath,
            preview: normalizedRows.slice(0, 3),
        });
    } catch (error) {
        console.error("[test-bigquery] failed", error);

        return NextResponse.json(
            {
                ok: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}