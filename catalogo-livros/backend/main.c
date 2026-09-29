#include <stdio.h>
#include "ordenacao.h"

#define MAX_LIVROS 5

int main( ) {
    Livro livros[MAX_LIVROS] = {
        {"O Pequeno Principe", 29.90},
        {"Dom Casmurro", 39.90},
        {"A Arte da Guerra", 25.50},
        {"1984", 34.00},
        {"Memorias Postumas de Bras Cubas", 42.75},
        {"Cronicas de um Babaca", 189.00},
        {"O diario de um banana", 50.50}
    };

    printf("Catalogo original:\n");
    exibirLivros(livros, MAX_LIVROS);
    int opcao;
    do{

        
        printf("\nEscolha uma opção de ordenação:\n");
        printf("1. Ordenar por nome (crescente)\n");
        printf("2. Ordenar por nome (decrescente)\n");
        printf("3. Ordenar por valor (crescente)\n");
        printf("4. Ordenar por valor (decrescente)\n");
        printf("5. Sair\n");
        
        scanf("%d", &opcao);
        
        switch (opcao) {
            case 1:
                ordenarPorNome(livros, MAX_LIVROS, 1);
                exibirLivros(livros, MAX_LIVROS);
                break;
            case 2:
                ordenarPorNome(livros, MAX_LIVROS, 0);
                exibirLivros(livros, MAX_LIVROS);
                break;
            case 3:
                ordenarPorValor(livros, MAX_LIVROS, 1);
                exibirLivros(livros, MAX_LIVROS);
                break;
            case 4:
                ordenarPorValor(livros, MAX_LIVROS, 0);
                exibirLivros(livros, MAX_LIVROS);
                break;
            case 5:
                printf("Saindo...\n");
                break;
            default:
                printf("Opção inválida.\n");
        }
    }while(opcao != 5);
    
    return 0;
}