import { requiredEnv } from "./required-env";

describe("Required Env", () => {

    const ENV_VAR = "TEST_REQUIRED_ENV_VAR";

    afterEach(() => {
        delete process.env[ENV_VAR];
    })

    it("returns the value when the env value is set", () => {
        process.env[ENV_VAR] = "some_value";

        expect(requiredEnv(ENV_VAR)).toBe("some_value");
    });

    it("throws when the env variable is missing", () => {
        delete process.env[ENV_VAR];

        expect(() => requiredEnv(ENV_VAR)).toThrow(`Missing required env variable ${ENV_VAR}`);
    });

    it("throws when env variable is an empty string", () => {
        process.env[ENV_VAR] = "";

        expect(() => requiredEnv(ENV_VAR)).toThrow(`Missing required env variable ${ENV_VAR}`);
    });
});