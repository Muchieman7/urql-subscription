import { gql, createClient, defaultExchanges, subscriptionExchange } from 'urql';
import { pipe, subscribe } from 'wonka';
import { createClient as createWSClient } from 'graphql-ws';
import WebSocket from 'ws'

const wsClient = createWSClient({
    url: 'ws://example/graphql',
    webSocketImpl: WebSocket
})

const client = createClient({
    url: 'http://example/graphql',
    exchanges: [
        ...defaultExchanges,
        subscriptionExchange({
            forwardSubscription: (operation) => ({
                subsribe: (sink) => ({
                    unsubscribe: wsClient.subscribe(operation, sink),
                })
            })
        }),
    ],
    requestPolicy: 'network-only',
})



const QUERY = gql`
    subscription {
        device {
            id
            name
            status
        }
    }
`;

const { unsubscribe } = pipe(
    client.subscription(QUERY),
    subscribe(result => {
        result.data.device.forEach(d => {
            console.log(d.id)
        })
    })
)
