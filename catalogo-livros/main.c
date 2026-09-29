#include <stdio.h>
#include "backend/ordenacao.h"

int main() {
    Livro livros[3] = {
        {"Dom Casmurro", 39.90},
        {"A Arte da Guerra", 25.50},
        {"O Pequeno Principe", 30.00}
    };

    printf("Antes da ordenacao:\n");
    exibirLivros(livros, 3);

    ordenarPorNome(livros, 3, 1);

    printf("\nDepois da ordenacao por nome (crescente):\n");
    exibirLivros(livros, 3);

    ordenarPorValor(livros, 3, 0);

    printf("\nDepois da ordenacao por valor (decrescente):\n");
    exibirLivros(livros, 3);

    return 0;
}
