export const getDatabaseSynchronize = () => {
    if (process.env.NODE_ENV === "test") {
        return true;
    }

    const synchronizeOverride = process.env.DATABASE_SYNCHRONIZE?.toLowerCase();
    if (synchronizeOverride === "true") {
        return true;
    }

    if (synchronizeOverride === "false") {
        return false;
    }

    return process.env.NODE_ENV !== "production";
};