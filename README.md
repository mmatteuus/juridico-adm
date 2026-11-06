# JURIDO — SuperAdmin (Demonstração)

Frontend independente para demonstração da administração da plataforma SaaS jurídico. Os dados são **fictícios**, armazenados apenas no navegador; não há autenticação real, backend, banco de dados nem operações financeiras efetivas.

## Funcionalidades de demonstração

- Dashboard executivo e indicadores
- Escritórios e fichas administrativas
- Contas, perfis e acessos ilustrativos
- Planos, licenças e assinaturas
- Financeiro SaaS e revendedores
- Suporte e incidentes
- Banco, tráfego, domínios, filas e custos de infraestrutura
- Segurança e auditoria
- Aplicações de terceiros, APIs e webhooks ilustrativos
- Releases e configurações

## Executar localmente

Requer Node.js compatível com a versão do Vite declarada no projeto.

```bash
npm ci
npm run dev
```

## Verificações

```bash
npm run lint
npm run test
npm run build
```

## Limites da demonstração

A seleção de perfil é apenas visual, sem proteção de segurança real. Os comandos exibidos são simulações e não acessam provedores. Não utilizar dados de clientes reais ou credenciais neste frontend.

O aplicativo é mantido separadamente do painel dos escritórios e do repositório principal do JURIDO.
