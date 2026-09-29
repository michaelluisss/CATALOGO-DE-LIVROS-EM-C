#include "ordenacao.h"

#include <stdlib.h>
#include <string.h>

static void trim(char *texto) {
    size_t len = strlen(texto);
    while (len > 0 && (texto[len - 1] == '\n' || texto[len - 1] == '\r' || texto[len - 1] == ' ' || texto[len - 1] == '\t')) {
        texto[len - 1] = '\0';
        len--;
    }
}

void carregarLivrosPadrao(Livro arr[], int *n) {
    const char *nomes[] = {
        "O Pequeno Principe",
        "Dom Casmurro",
        "A Arte da Guerra",
        "1984",
        "Memorias Postumas de Bras Cubas"
    };
    const double valores[] = {29.90, 39.90, 25.50, 34.00, 42.75};

    *n = 5;
    for (int i = 0; i < *n; i++) {
        snprintf(arr[i].nome, sizeof(arr[i].nome), "%s", nomes[i]);
        arr[i].valor = valores[i];
    }
}

int lerLivrosPorStdin(Livro arr[], int *n) {
    char linha[256];
    int qtd = 0;

    while (fgets(linha, sizeof(linha), stdin) != NULL && qtd < MAX_LIVROS) {
        trim(linha);
        if (linha[0] == '\0') {
            continue;
        }

        char *separador = strchr(linha, '|');
        if (separador == NULL) {
            continue;
        }

        *separador = '\0';
        char *valorTexto = separador + 1;
        trim(linha);
        trim(valorTexto);

        strncpy(arr[qtd].nome, linha, sizeof(arr[qtd].nome) - 1);
        arr[qtd].nome[sizeof(arr[qtd].nome) - 1] = '\0';
        arr[qtd].valor = atof(valorTexto);
        qtd++;
    }

    *n = qtd;
    return qtd;
}

int interpretarCritero(const char *texto) {
    if (texto == NULL) return 0;
    if (strcmp(texto, "nome") == 0 || strcmp(texto, "n") == 0) return 1;
    if (strcmp(texto, "preco") == 0 || strcmp(texto, "valor") == 0 || strcmp(texto, "v") == 0) return 2;
    return 0;
}

int interpretarDirecao(const char *texto) {
    if (texto == NULL) return 1;
    if (strcmp(texto, "crescente") == 0 || strcmp(texto, "asc") == 0 || strcmp(texto, "1") == 0) return 1;
    if (strcmp(texto, "decrescente") == 0 || strcmp(texto, "desc") == 0 || strcmp(texto, "0") == 0) return 0;
    return 1;
}

void ordenarPorNome(Livro arr[], int n, int crescente) {
    for (int i = 1; i < n; i++) {
        Livro atual = arr[i];
        int j = i - 1;

        while (j >= 0) {
            int deveMover = crescente
                ? (strcmp(arr[j].nome, atual.nome) > 0)
                : (strcmp(arr[j].nome, atual.nome) < 0);

            if (!deveMover) {
                break;
            }

            arr[j + 1] = arr[j];
            j--;
        }

        arr[j + 1] = atual;
    }
}

void ordenarPorValor(Livro arr[], int n, int crescente) {
    for (int i = 1; i < n; i++) {
        Livro atual = arr[i];
        int j = i - 1;

        while (j >= 0) {
            int deveMover = crescente
                ? (arr[j].valor > atual.valor)
                : (arr[j].valor < atual.valor);

            if (!deveMover) {
                break;
            }

            arr[j + 1] = arr[j];
            j--;
        }

        arr[j + 1] = atual;
    }
}

void ordenar(Livro arr[], int n, int criterio, int crescente) {
    if (criterio == 1) {
        ordenarPorNome(arr, n, crescente);
    } else if (criterio == 2) {
        ordenarPorValor(arr, n, crescente);
    }
}

void cadastrarLivro(Livro arr[], int n) {
    for (int i = 0; i < n; i++) {
        printf("Digite o nome do livro %d: ", i + 1);
        if (fgets(arr[i].nome, sizeof(arr[i].nome), stdin) == NULL) {
            arr[i].nome[0] = '\0';
            continue;
        }

        arr[i].nome[strcspn(arr[i].nome, "\r\n")] = '\0';

        printf("Digite o valor do livro %d: ", i + 1);
        scanf("%lf", &arr[i].valor);
        while (getchar() != '\n') {
            continue;
        }
    }
}

void exibirLivros(const Livro arr[], int n) {
    printf("\nCatalogo de livros:\n");
    for (int i = 0; i < n; i++) {
        printf("%d. %s - R$ %.2f\n", i + 1, arr[i].nome, arr[i].valor);
    }
}

void exibirLivrosJson(const Livro arr[], int n) {
    printf("[\n");
    for (int i = 0; i < n; i++) {
        printf("  {\"nome\":\"%s\",\"valor\":%.2f}%s\n",
               arr[i].nome,
               arr[i].valor,
               (i < n - 1) ? "," : "");
    }
    printf("]\n");
}