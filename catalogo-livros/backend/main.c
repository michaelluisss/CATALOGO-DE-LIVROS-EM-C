#include <stdio.h>
#include <string.h>

#include "ordenacao.h"

static void mostrarMenu(void) {
    printf("\nEscolha uma opção de ordenação:\n");
    printf("1. Ordenar por nome (crescente)\n");
    printf("2. Ordenar por nome (decrescente)\n");
    printf("3. Ordenar por valor (crescente)\n");
    printf("4. Ordenar por valor (decrescente)\n");
    printf("5. Sair\n");
}

int main(int argc, char *argv[]) {
    Livro livros[MAX_LIVROS];
    int quantidade = 0;
    int criterio = 0;
    int crescente = 1;

    if (argc >= 3) {
        criterio = interpretarCritero(argv[1]);
        crescente = interpretarDirecao(argv[2]);

        if (criterio == 0) {
            fprintf(stderr, "Uso: %s <nome|preco> <crescente|decrescente> [--stdin]\n", argv[0]);
            return 1;
        }

        if (argc >= 4 && strcmp(argv[3], "--stdin") == 0) {
            if (lerLivrosPorStdin(livros, &quantidade) == 0) {
                fprintf(stderr, "Nenhum livro recebido via stdin.\n");
                return 1;
            }
        } else {
            carregarLivrosPadrao(livros, &quantidade);
        }

        ordenar(livros, quantidade, criterio, crescente);
        exibirLivrosJson(livros, quantidade);
        return 0;
    }

    carregarLivrosPadrao(livros, &quantidade);
    printf("Catalogo original:\n");
    exibirLivros(livros, quantidade);

    int opcao;
    do {
        mostrarMenu();
        scanf("%d", &opcao);

        switch (opcao) {
            case 1:
                ordenarPorNome(livros, quantidade, 1);
                exibirLivros(livros, quantidade);
                break;
            case 2:
                ordenarPorNome(livros, quantidade, 0);
                exibirLivros(livros, quantidade);
                break;
            case 3:
                ordenarPorValor(livros, quantidade, 1);
                exibirLivros(livros, quantidade);
                break;
            case 4:
                ordenarPorValor(livros, quantidade, 0);
                exibirLivros(livros, quantidade);
                break;
            case 5:
                printf("Saindo...\n");
                break;
            default:
                printf("Opção inválida.\n");
        }
    } while (opcao != 5);

    return 0;
}