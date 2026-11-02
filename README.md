# File Commander

Utilitário de linha de comando baseado em Node.js para executar operações
simples em arquivos a partir de instruções escritas em `command.txt`.

O programa monitora o arquivo de comandos continuamente. Sempre que uma nova
instrução é gravada, ela é interpretada e executada no sistema de arquivos.
Isso torna o projeto útil como uma automação simples entre processos ou como
exemplo de uso do módulo nativo `fs/promises` e do observador `fs.watch`.

## Funcionalidades

- Criar um arquivo, incluindo os diretórios pai que ainda não existirem.
- Excluir um arquivo.
- Renomear ou mover um arquivo.
- Adicionar conteúdo ao final de um arquivo existente.
- Encerrar o processo de monitoramento.
- Informar no terminal o resultado da operação ou o motivo da falha.

## Requisitos

- Node.js 14.17 ou superior (recomendado: uma versão LTS atual).
- Permissão de leitura e escrita no diretório em que o projeto será executado.

O projeto usa apenas módulos nativos do Node.js e não possui dependências
externas.

## Como executar

Clone o repositório e entre na pasta do projeto:

```bash
git clone <URL_DO_REPOSITORIO>
cd file-commander
```

Inicie o monitor:

```bash
node app.js
```

O processo ficará ativo aguardando alterações em `command.txt`. Para enviar
uma instrução, abra esse arquivo em outra janela, escreva um comando completo,
salve-o e observe a saída no terminal onde `node app.js` está em execução.

Depois que a instrução é processada, o programa limpa `command.txt`, deixando-o
pronto para o próximo comando.

## Comandos disponíveis

Os caminhos podem ser relativos ao diretório em que `node app.js` foi
iniciado ou absolutos.

| Comando                | Sintaxe                                  | Exemplo                                            |
| ---------------------- | ---------------------------------------- | -------------------------------------------------- |
| Criar arquivo          | `create file <caminho>`                  | `create file notes/today.txt`                      |
| Excluir arquivo        | `delete file <caminho>`                  | `delete file notes/today.txt`                      |
| Renomear/mover arquivo | `rename file <origem> to <destino>`      | `rename file notes/today.txt to notes/archive.txt` |
| Adicionar conteúdo     | `add to file <caminho> content: <texto>` | `add to file notes/today.txt content: First entry` |
| Encerrar o monitor     | `close`                                  | `close`                                            |

### Exemplos práticos

Com o monitor em execução, escreva cada uma das linhas abaixo em
`command.txt`, salvando o arquivo após cada comando:

```text
create file workspace/readme.txt
add to file workspace/readme.txt content: Projeto iniciado.
rename file workspace/readme.txt to workspace/README.txt
delete file workspace/README.txt
```

Para encerrar a aplicação:

```text
close
```

## Saída no terminal

As operações concluídas exibem mensagens como:

```text
File successfully created!
File successfully updated!
File successfully renamed!
File successfully deleted!
```

Quando uma operação não pode ser executada, o programa informa a causa, por
exemplo:

```text
The file notes/missing.txt does not exist.
The file notes/today.txt already exists.
Invalid command.
```

## Como funciona

1. [`app.js`](./app.js) importa e inicia a função `start`.
2. [`methods.js`](./methods.js) limpa `command.txt` e cria um observador com
   `fs.watch`.
3. Ao detectar uma alteração, o conteúdo é lido como texto UTF-8.
4. O comando é identificado pelos prefixos definidos em
   [`commands.js`](./commands.js).
5. A operação correspondente é executada com APIs nativas assíncronas de
   arquivos.
6. O arquivo de comando é limpo após o processamento.

Não há servidor HTTP, banco de dados ou interface gráfica: a comunicação é
feita exclusivamente pelo arquivo `command.txt` e pelo terminal.

## Decisões e limitações atuais

- Apenas um comando deve ser colocado em `command.txt` por vez.
- O arquivo é limpo quando a aplicação inicia e depois de cada comando
  processado; portanto, não use esse arquivo para armazenar dados permanentes.
- O comando `add to file` adiciona o texto exatamente ao final do arquivo,
  sem inserir automaticamente uma quebra de linha.
- O conteúdo do comando é tratado como uma única linha; caracteres como
  `content: ` são delimitadores da sintaxe.
- `create file` cria diretórios pai automaticamente.
- `rename file` depende de que o diretório de destino já exista.
- O programa opera com as permissões do usuário que o iniciou e não oferece
  autenticação, autorização ou sandboxing. Não exponha o diretório monitorado
  a entradas não confiáveis.
- O encerramento por `close` finaliza o processo imediatamente.

## Estrutura do projeto

```text
.
├── app.js        # Ponto de entrada
├── commands.js   # Comandos reconhecidos
├── methods.js    # Monitoramento e operações no sistema de arquivos
└── command.txt   # Canal de entrada das instruções
```
