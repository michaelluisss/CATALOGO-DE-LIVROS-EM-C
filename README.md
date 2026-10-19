# Catálogo de Livros

Frontend responsivo em React e Vite integrado a uma API HTTP em C. O catálogo começa com cinco exemplos e permite cadastrar livros e ordenar por título ou preço. Os dados ficam na memória do servidor e voltam aos exemplos quando ele reinicia.

## Requisitos

- GCC
- Node.js 18 ou superior e npm

## Iniciar a API em C

```bash
cd catalogo-livros/backend
gcc -Wall -Wextra -std=c11 server.c ordenacao.c -o api-server
./api-server
```

A API fica disponível em `http://localhost:8080`.

- `GET /api/livros` lista os títulos.
- `GET /api/livros?criterio=nome&ordem=asc` ordena por título. Use `desc` para inverter a ordem.
- `GET /api/livros?criterio=valor&ordem=asc` ordena por preço.
- `POST /api/livros` recebe JSON, por exemplo `{"nome":"O nome do vento","valor":49.9}`.

## Iniciar o React

Em outro terminal:

```bash
cd catalogo-livros
npm install
npm run dev
```

Abra `http://localhost:5173` no PC. O Vite escuta na rede local e encaminha `/api` para o servidor C em `localhost:8080`, então um celular na mesma rede Wi-Fi também pode abrir `http://IP-DO-PC:5173` sem expor a API diretamente. Para apontar o frontend a outra API, defina `VITE_API_URL`.

Para gerar a versão de produção, execute `npm run build` dentro de `catalogo-livros`.
