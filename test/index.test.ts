import { hello } from "../src";

test("hello", () => {
  expect(hello("World")).toEqual("Hello World");
});
