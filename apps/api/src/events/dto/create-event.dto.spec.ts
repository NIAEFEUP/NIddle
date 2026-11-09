import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateEventDto } from "./create-event.dto";
import { UpdateEventDto } from "./update-event.dto";

describe("CreateEventDto validation", () => {
  const base = { name: "FEUP Week", year: 2025 };

  const errorsFor = async (plain: object) =>
    (await validate(plainToInstance(CreateEventDto, plain))).map(
      (e) => e.property,
    );

  it("accepts an event with image and location", async () => {
    const errors = await errorsFor({
      ...base,
      image: "/api_images/events/sinf_2025.jpg",
      location: "FEUP",
    });

    expect(errors).toEqual([]);
  });

  it("accepts an event without image and location", async () => {
    const errors = await errorsFor(base);

    expect(errors).toEqual([]);
  });

  it.each([
    ["image", 123],
    ["image", true],
    ["image", ["/a.png"]],
    ["location", 123],
    ["location", { room: "B001" }],
  ])("rejects a non-string %s (%p)", async (property, value) => {
    const errors = await errorsFor({ ...base, [property]: value });

    expect(errors).toEqual([property]);
  });
});

describe("UpdateEventDto validation", () => {
  it("accepts updating only the location", async () => {
    const dto = plainToInstance(UpdateEventDto, { location: "Auditório B001" });

    expect(await validate(dto)).toEqual([]);
  });

  it("rejects a non-string image", async () => {
    const dto = plainToInstance(UpdateEventDto, { image: 42 });

    const errors = await validate(dto);

    expect(errors.map((e) => e.property)).toEqual(["image"]);
  });
});
