### HOW TO TEST LOCALLY

1/ Install `yalc` package via: 

```bash
  npm i yalc -g
```

document here: https://github.com/wclr/yalc

2/ Install dependencies

```bash
  npm i
```

2/ Build package

```bash
  npm build
```

3/ Publish the package to Yalc store (locally)

```bash
  yalc publish
```

Example output after running command:

```bash
@kanalabs/aptos-kana-wallet-adapter@1.0.0 published in store.
```

4/ Install our package into react app using:

```bash
yalc add @kanalabs/aptos-kana-wallet-adapter
```

5/ Now use as normal

```jsx
import { WalletProvider } from "@manahippo/aptos-wallet-adapter";
import { KanaWalletAdapter } from "@kanalabs/aptos-kana-wallet-adapter";

const wallets = [new KanaWalletAdapter()] as any[];
function App() {
  return (
    <WalletProvider
      wallets={wallets}
      autoConnect={false} /** allow auto wallet connection or not **/
      onError={(error: Error) => {
        console.log("Handle Error Message", error);
      }}
    >
      ....
    </WalletProvider>
  );
}
```

NOTE: 
1/ When make changes on @kanalabs/aptos-kana-wallet-adapter project, in order to reflect the changes on React app.
Follow these steps:

a/ Rebuild package:

```bash
  npm build
```

b/ Publish new changes on Yalc store

```bash
  yalc publish --push
```
