// Instalar todas as dependências utilizadas no projeto

    cd voting-blockchain-frontend
    npm install

// RODAR primeiro NÓ:
    // Backend 4000

        cd voting-blockchain-frontend\src\services
        $env:INITIAL_PEERS = "http://localhost:4001"; $env:PORT=4000; node index.js

    // Frontend 3000

        cd voting-blockchain-frontend\src\services
        $env:PORT = 3000
        $env:REACT_APP_API_URL = "http://localhost:4000"
        npm start


// RODAR segundo NÓ:
    // Backend 4001

        cd voting-blockchain-fr        $env:INITIAL_PEERS = "http://localhost:4000"; $env:PORT=4001; node index.js
ontend\src\services

    // Frontend 3001

        cd voting-blockchain-frontend\src\services
        $env:PORT = 3001
        $env:REACT_APP_API_URL = "http://localhost:4001"
        npm start