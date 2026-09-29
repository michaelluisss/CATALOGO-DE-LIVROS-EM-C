#include "ordenacao.h"

#include <string.h>

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

void ordenar(Livro arr[], int n, int op) {
    if (op == 1) {
        ordenarPorNome(arr, n, 1);
    } else if (op == 2) {
        ordenarPorValor(arr, n, 1);
    }
    else {
        // Opção inválida, não faz nada
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