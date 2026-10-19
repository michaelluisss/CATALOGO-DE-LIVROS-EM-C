#define _POSIX_C_SOURCE 200809L
#include "ordenacao.h"

#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>

#define PORT 8080
#define REQUEST_SIZE 16384

static Livro livros[MAX_LIVROS];
static int quantidade;

static void enviar(int cliente, const char *status, const char *tipo, const char *corpo) {
    char cabecalho[512];
    int tamanho = (int)strlen(corpo);
    int n = snprintf(cabecalho, sizeof(cabecalho),
        "HTTP/1.1 %s\r\nContent-Type: %s; charset=utf-8\r\nContent-Length: %d\r\n"
        "Access-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
        "Access-Control-Allow-Headers: Content-Type\r\nConnection: close\r\n\r\n",
        status, tipo, tamanho);
    send(cliente, cabecalho, (size_t)n, 0);
    send(cliente, corpo, (size_t)tamanho, 0);
}

static void json_string(char *dest, size_t capacidade, const char *origem) {
    size_t j = 0;
    for (size_t i = 0; origem[i] && j + 2 < capacidade; i++) {
        unsigned char c = (unsigned char)origem[i];
        if (c == '"' || c == '\\') { dest[j++] = '\\'; dest[j++] = (char)c; }
        else if (c >= 32) dest[j++] = (char)c;
    }
    dest[j] = '\0';
}

static void listar(int cliente) {
    char corpo[REQUEST_SIZE];
    size_t usado = 0;
    usado += (size_t)snprintf(corpo + usado, sizeof(corpo) - usado, "[");
    for (int i = 0; i < quantidade && usado < sizeof(corpo) - 160; i++) {
        char nome[220];
        json_string(nome, sizeof(nome), livros[i].nome);
        usado += (size_t)snprintf(corpo + usado, sizeof(corpo) - usado,
            "%s{\"id\":%d,\"nome\":\"%s\",\"valor\":%.2f}", i ? "," : "", i + 1, nome, livros[i].valor);
    }
    snprintf(corpo + usado, sizeof(corpo) - usado, "]");
    enviar(cliente, "200 OK", "application/json", corpo);
}

static int obter_string(const char *json, const char *chave, char *saida, size_t capacidade) {
    char busca[64];
    snprintf(busca, sizeof(busca), "\"%s\"", chave);
    const char *p = strstr(json, busca);
    if (!p || !(p = strchr(p + strlen(busca), ':'))) return 0;
    while (isspace((unsigned char)*++p)) {}
    if (*p++ != '"') return 0;
    size_t i = 0;
    while (*p && *p != '"' && i + 1 < capacidade) {
        if (*p == '\\' && p[1]) p++;
        saida[i++] = *p++;
    }
    saida[i] = '\0';
    return *p == '"';
}

static void atender(int cliente) {
    char req[REQUEST_SIZE];
    ssize_t lido = recv(cliente, req, sizeof(req) - 1, 0);
    if (lido <= 0) return;
    req[lido] = '\0';
    char metodo[8] = {0}, caminho[256] = {0};
    sscanf(req, "%7s %255s", metodo, caminho);
    if (strcmp(metodo, "OPTIONS") == 0) { enviar(cliente, "204 No Content", "text/plain", ""); return; }
    if (strcmp(metodo, "GET") == 0 && strncmp(caminho, "/api/livros", 11) == 0) {
        if (strstr(caminho, "criterio=nome")) ordenar(livros, quantidade, 1, strstr(caminho, "ordem=desc") == NULL);
        else if (strstr(caminho, "criterio=valor")) ordenar(livros, quantidade, 2, strstr(caminho, "ordem=desc") == NULL);
        listar(cliente); return;
    }
    if (strcmp(metodo, "POST") == 0 && strcmp(caminho, "/api/livros") == 0) {
        char nome[100];
        const char *body = strstr(req, "\r\n\r\n");
        double valor = 0;
        if (body) {
            body += 4;
            char *v = strstr((char *)body, "\"valor\"");
            if (v && (v = strchr(v, ':'))) valor = strtod(v + 1, NULL);
        }
        if (!body || !obter_string(body, "nome", nome, sizeof(nome)) || !nome[0] || valor <= 0 || quantidade >= MAX_LIVROS) {
            enviar(cliente, "400 Bad Request", "application/json", "{\"erro\":\"Informe um título e um preço válido.\"}"); return;
        }
        snprintf(livros[quantidade].nome, sizeof(livros[quantidade].nome), "%s", nome);
        livros[quantidade++].valor = valor;
        enviar(cliente, "201 Created", "application/json", "{\"ok\":true}"); return;
    }
    enviar(cliente, "404 Not Found", "application/json", "{\"erro\":\"Rota não encontrada.\"}");
}

int main(void) {
    carregarLivrosPadrao(livros, &quantidade);
    int servidor = socket(AF_INET, SOCK_STREAM, 0);
    int sim = 1;
    setsockopt(servidor, SOL_SOCKET, SO_REUSEADDR, &sim, sizeof(sim));
    struct sockaddr_in endereco = {0};
    endereco.sin_family = AF_INET;
    endereco.sin_addr.s_addr = htonl(INADDR_ANY);
    endereco.sin_port = htons(PORT);
    if (servidor < 0 || bind(servidor, (struct sockaddr *)&endereco, sizeof(endereco)) < 0 || listen(servidor, 16) < 0) {
        perror("Não foi possível iniciar a API"); return 1;
    }
    printf("API do catálogo disponível em http://localhost:%d\n", PORT);
    for (;;) {
        int cliente = accept(servidor, NULL, NULL);
        if (cliente < 0) continue;
        atender(cliente);
        close(cliente);
    }
}
