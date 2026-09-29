#ifndef ORDENACAO_H
#define ORDENACAO_H

#include <stdio.h>

typedef struct {
    char nome[100];
    double valor;
} Livro;

void cadastrarLivro(Livro arr[], int n);
void ordenarPorNome(Livro arr[], int n, int crescente);
void ordenarPorValor(Livro arr[], int n, int crescente);
void ordenar(Livro arr[], int n, int op);
void exibirLivros(const Livro arr[], int n);

#endif 