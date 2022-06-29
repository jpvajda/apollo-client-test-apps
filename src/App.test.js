import { MockedProvider } from "@apollo/react-testing";
import { ADD_TODO, AddTodo } from "./index";
import TestRenderer from "react-test-renderer";

// tests render of AddTodo Component
it("should render without error", () => {
  TestRenderer.create(
    <MockedProvider mocks={[]}>
      <AddTodo />
    </MockedProvider>
  );
});

// tests mutation of AddTodo
it("should render loading state initially", () => {
  const mocks = [
    {
      request: {
        query: ADD_TODO,
        variables: { text: "test todo" },
      },
    },
  ];

  const component = TestRenderer.create(
    <MockedProvider mocks={mocks} addTypename={false}>
      <AddTodo />
    </MockedProvider>
  );

  const tree = component.toJSON();

  expect(tree.children).toContain("Loading...");
});
