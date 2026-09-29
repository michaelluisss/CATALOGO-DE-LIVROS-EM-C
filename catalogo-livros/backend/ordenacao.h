#ifndef ORDENACAO_H
#define ORDENACAO_H

#include <stdio.h>

#define MAX_LIVROS 100

typedef struct {
    char nome[100];
    double valor;
} Livro;

void carregarLivrosPadrao(Livro arr[], int *n);
int lerLivrosPorStdin(Livro arr[], int *n);
int interpretarCritero(const char *texto);
int interpretarDirecao(const char *texto);
void cadastrarLivro(Livro arr[], int n);
void ordenarPorNome(Livro arr[], int n, int crescente);
void ordenarPorValor(Livro arr[], int n, int crescente);
void ordenar(Livro arr[], int n, int criterio, int crescente);
void exibirLivros(const Livro arr[], int n);
void exibirLivrosJson(const Livro arr[], int n);

#endif 