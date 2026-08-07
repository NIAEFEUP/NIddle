import * as Sentry from "@sentry/nestjs";
import { Logger, QueryRunner } from "typeorm";

export class SentryTypeOrmLogger implements Logger {
    logQuery() {}

    logQueryError(error: string | Error, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        Sentry.addBreadcrumb({
            category: "typeorm",
            message: "Query Error",
            level: "error",
            data: { query, parameters },
        })
    }
    logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        Sentry.captureMessage(`Slow query detected: ${query}`, {
            level: "warning",
            extra: { time, parameters },
        });
    }
    logSchemaBuild(message: string, queryRunner?: QueryRunner) {}

    // TODO: Implement logMigration to log migration events to Sentry
    logMigration(message: string) {
        console.log(`[TypeORM] ${message}`);
    }

    log() {}
}