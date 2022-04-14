import React from "react";
import { render } from "react-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql,
  ApolloLink,
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
      },
      createHttpLink: () => createHttpLink(),
    }),
  ]),
});

//Exchange Rate Code Start

const EXCHANGE_RATES = gql`
  query GetExchangeRates @api(contextKey: exchanges) {
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

//Exchange Rate Code End

// Dog Code Start

const GET_DOGS = gql`
  query GetDogs @api(name: dogs) {
    dogs {
      id
      breed
    }
  }
`;

function Dogs({ onDogSelected }) {
  const { loading, error, data } = useQuery(GET_DOGS);

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
  const { loading, error, data } = useQuery(GET_DOG_PHOTO, {
    variables: { breed },
    pollInterval: 500,
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  return (
    <img src={data.dog.displayImage} style={{ height: 100, width: 100 }} />
  );
}

// Dog Code End

function App() {
  return (
    <div>
      <h2>Exchange Rates 💰 </h2>
      <ExchangeRates />
      <h2>Dogs 🐕 </h2>
      <Dogs />
      <DogPhoto />
    </div>
  );
}

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);
