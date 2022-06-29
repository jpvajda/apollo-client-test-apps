import { createRoot } from "react-dom/client";
// import { render } from "react-dom"; React 17
import React from "react";
import {
  ApolloClient,
  InMemoryCache,
  useLazyQuery,
  ApolloProvider,
  useQuery,
  gql,
  ApolloLink,
  NetworkStatus,
  useMutation,
} from "@apollo/client";
import { createHttpLink } from "apollo-link-http";
import { MultiAPILink } from "@habx/apollo-multi-endpoint-link";

// uses  https://github.com/habx/apollo-multi-endpoint-link to fetch from
// many endpoints

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([
    new MultiAPILink({
      endpoints: {
        exchanges: "https://48p1r2roz4.sse.codesandbox.io",
        dogs: "https://71z1g.sse.codesandbox.io/",
        todo: "https://sxewr.sse.codesandbox.io/",
      },
      createHttpLink: () => createHttpLink(),
    }),
  ]),
});

//Exchange Rate Code Start //

const EXCHANGE_RATES = gql`
  query GetExchangeRates @api(name: exchanges) {
    rates(currency: "USD") {
      currency
      rate
    }
  }
`;

function ExchangeRates() {
  const { loading, error, data } = useQuery(EXCHANGE_RATES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return data.rates.map(({ currency, rate }) => (
    <div key={currency}>
      <p>
        {currency}: {rate}
      </p>
    </div>
  ));
}

//Exchange Rate Code End //

// Dog Code Start //

const GET_DOGS = gql`
  query GetDogs @api(name: dogs) {
    dogs {
      id
      breed
    }
  }
`;

function Dogs({ onDogSelected }) {
  const { loading, error, data } = useQuery(GET_DOGS, {
    fetchPolicy: "network-only", // Doesn't check cache before making a network request
    nextFetchPolicy: "cache-first", // Used for subsequent executions
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <select name="dog" onChange={onDogSelected}>
      {data.dogs.map((dog) => (
        <option key={dog.id} value={dog.breed}>
          {dog.breed}
        </option>
      ))}
    </select>
  );
}

const GET_DOG_PHOTO = gql`
  query Dog($breed: String!) @api(name: dogs) {
    dog(breed: $breed) {
      id
      displayImage
    }
  }
`;

function DogPhoto({ breed }) {
  const { loading, error, data, refetch, networkStatus } = useQuery(
    GET_DOG_PHOTO,
    {
      variables: { breed },
      notifyOnNetworkStatusChange: true,
      pollInterval: 0, // fetch the current breed's image from the server every x seconds
    }
  );

  if (networkStatus === NetworkStatus.refetch) return "Refetching!";
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  return (
    <div>
      <img
        src={data.dog.displayImage}
        style={{ height: 100, width: 100 }}
        alt="it's a dog"
      />
      <button
        onClick={() =>
          refetch({
            breed: "dalmatian", // Always refetches a dalmatian instead of original breed
          })
        }
      >
        Refetch!
      </button>
    </div>
  );
}

function DelayedQuery() {
  const [getDog, { loading, error, data }] = useLazyQuery(GET_DOG_PHOTO);
  if (loading) return <p>Loading ...</p>;
  if (error) return `Error! ${error}`;

  return (
    <div>
      {data?.dog && (
        <img
          src={data.dog.displayImage}
          style={{ height: 100, width: 100 }}
          alt="it's a dog"
        />
      )}
      <button
        style={{ display: "flex" }}
        onClick={() => getDog({ variables: { breed: "bulldog" } })}
      >
        Click me!
      </button>
    </div>
  );
}

// Dog Code End //

// To Do Code Start //

const GET_TODOS = gql`
  query GetTodos @api(name: todo) {
    todos {
      id
      type
    }
  }
`;

function ToDos() {
  const { loading, error, data } = useQuery(GET_TODOS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return data.todos.map(({ id, type }) => {
    let input;

    return (
      <div key={id}>
        <p>{type}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.value.trim()) {
              return;
            }

            input.value = "";
          }}
        >
          <input
            ref={(node) => {
              input = node;
            }}
          />
          <button type="submit">Update Todo</button>
        </form>
      </div>
    );
  });
}

const ADD_TODO = gql`
  mutation AddTodo($text: String!) @api(name: todo) {
    addTodo(text: $text) {
      id
      text
    }
  }
`;

function AddTodo() {
  let input;
  const [addTodo, { loading, error }] = useMutation(ADD_TODO, {
    variables: {
      text: "placeholder",
    },
  });

  if (loading) return "Submitting...";
  if (error) return `Submission error! ${error.message}`;

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTodo({ variables: { text: input.value } });
          input.value = "";
        }}
      >
        <input
          ref={(node) => {
            input = node;
          }}
        />
        <button type="submit">Add Todo</button>
      </form>
    </div>
  );
}

// To Do Code End //

function App() {
  return (
    <div>
      <h2>Exchange Rates 💰 </h2>
      <ExchangeRates />
      <h2>Dogs 🐕 </h2>
      <Dogs />
      <DogPhoto />
      <h2>Delayed Query 🤷 </h2>
      <DelayedQuery />
      <h2>To Dos ✅ </h2>
      <ToDos />
      <h2>Add Do ✅ </h2>
      <AddTodo />
    </div>
  );
}

// React 18
const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);

// React 17
// render(
//   <ApolloProvider client={client}>
//     <App />
//   </ApolloProvider>,
//   document.getElementById("root")
// );
