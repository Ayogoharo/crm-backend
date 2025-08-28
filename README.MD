yarn install
yarn build
npx typeorm migration:run -d ./dist/data-source.js
