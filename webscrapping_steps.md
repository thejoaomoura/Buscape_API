## Realizar Webscraping De Produtos no Site do Buscapé

# Busca de produtos pela URL:

- Exemplo de URL para busca de produtos: `https://www.buscape.com.br/search?q=iphone%2014%20pls`


No código HTML retornado pelo site, os produtos estão organizados dentro de elementos com as seguintes classes:

1. **`Hits_ProductCard__Bonl_`** - Envolve cada cartão de produto.
2. **`ProductCard_ProductCard__WWKKW`** - Define o estilo do cartão de produto individual.

Se precisar manipular esses produtos via CSS ou JavaScript, você pode usar seletores como:

- Para todos os produtos:
  ```css
  .Hits_ProductCard__Bonl_
  ```

- Para acessar cada cartão de produto:
  ```css
  .ProductCard_ProductCard__WWKKW
  ``` 

Essas classes podem ser específicas do framework CSS utilizado na aplicação (provavelmente com nomes gerados dinamicamente).

No código fornecido, as informações específicas de cada produto (nome, preço, avaliação, link, etc.) estão organizadas nas seguintes classes e atributos:

### 1. **Nome do Produto**
- Seletor CSS: `.ProductCard_ProductCard_Name__U_mUQ`
- Atributo adicional: `data-testid="product-card::name"`
- Exemplo:
  ```html
  <h2 class="Text_Text__ARJdp Text_MobileLabelXs__dHwGG Text_DesktopLabelSAtLarge__wWsED ProductCard_ProductCard_Name__U_mUQ" id="product-card-12481772::name" data-testid="product-card::name">Celular Apple iPhone 14 Plus 128GB 6 GB</h2>
  ```

### 2. **Preço**
- Seletor CSS: `.ProductCard_ProductCard_BestMerchant__JQo_V` para o título do menor preço.
- Seletor CSS do valor do preço: `.Text_Text__ARJdp.Text_MobileHeadingS__HEz7L[data-testid="product-card::price"]`
- Exemplo:
  ```html
  <p class="Text_Text__ARJdp Text_MobileHeadingS__HEz7L" data-testid="product-card::price">R$ 4.199,00</p>
  ```

### 3. **Avaliação**
- Seletor CSS: `.ProductCard_ProductCard_Rating__kCx7o`
- Exemplo:
  ```html
  <div class="ProductCard_ProductCard_Rating__kCx7o" data-testid="product-card::rating">
      <svg ...></svg>4.8<!-- --> (974)
  </div>
  ```

### 4. **Link de Redirecionamento**
- Seletor CSS: `.ProductCard_ProductCard_Inner__gapsh`
- Atributo: `href`
- Exemplo:
  ```html
  <a class="ProductCard_ProductCard_Inner__gapsh" href="/celular/smartphone-apple-iphone-14-plus-128gb-camera-dupla?_lc=88&searchterm=iphone%2014%20plus" data-testid="product-card::card"></a>
  ```

### Resumo de Seletores CSS para Automação:
Você pode utilizar os seguintes seletores para capturar as informações:

- Nome do Produto:
  ```css
  .ProductCard_ProductCard_Name__U_mUQ
  ```
- Preço:
  ```css
  .Text_Text__ARJdp.Text_MobileHeadingS__HEz7L[data-testid="product-card::price"]
  ```
- Avaliação:
  ```css
  .ProductCard_ProductCard_Rating__kCx7o
  ```
- Link de Redirecionamento:
  ```css
  .ProductCard_ProductCard_Inner__gapsh
  ```

Se você estiver automatizando com bibliotecas como Puppeteer ou Selenium, pode utilizar essas classes para extrair as informações relevantes.

---

### 2. **Tags Superiores do Produto**
- **Finalidade**: Contém informações adicionais ou destaques do produto.
- **Seletor**: `.ProductCard_ProductCard_Tags___N1Ll`
- **Atributo adicional**: `data-testid="product-card::tags"`
- Exemplo:
  ```html
  <div class="ProductCard_ProductCard_Tags___N1Ll ProductCard_ProductCard_SuperiorTags__bKsrh" data-testid="product-card::tags" role="button" aria-label="Tags" tabindex="0">
      <em class="Pill_Pill__RTFcT Pill_RoundedSquare__FY0Ns PillThemes_Secondary__eA9bf Badge_Badge__H1QK1">Indica</em>
  </div>
  ```

---

### 3. **Imagem do Produto**
- **Finalidade**: URL da imagem do produto.
- **Seletor**: `.ProductCard_ProductCard_Image__4v1sa img`
- **Atributo relevante**: `src` (caminho da imagem)
- Exemplo:
  ```html
  <img alt="Imagem de Celular Apple iPhone 14 Plus 128GB 6 GB" src="https://i.zst.com.br/thumbs/45/7/34/-855686960.jpg">
  ```

---

### 4. **Condições do Produto**
- **Finalidade**: Informações sobre frete grátis, cashback, ou outras condições.
- **Seletor**: `.ProductCard_ProductCard_InferiorBadges__a0ENn`
- **Atributo adicional**: `data-testid="product-card::conditions"`
- Exemplo:
  ```html
  <span class="Text_Text__ARJdp Text_MobileTagXs___PwYE ProductCard_ProductCard_CashbackInfo__RDp2T" data-testid="product-card::cashback">
      <p class="Text_Text__ARJdp Text_MobileTagXs___PwYE">3% de volta</p>
  </span>
  ```

---

### 5. **Quantidade de Lojas para Comparação**
- **Finalidade**: Número de lojas onde o produto está disponível para comparação.
- **Seletor**: `.ProductCard_ProductCard_StoreCount__Vrcqy`
- Exemplo:
  ```html
  <p class="Text_Text__ARJdp Text_DesktopLabelXs__cMRcB ProductCard_ProductCard_StoreCount__Vrcqy">
      Compare entre 9 lojas
  </p>
  ```

---

### 6. **Informação de Parcelamento**
- **Finalidade**: Detalhes sobre o número de parcelas e valores.
- **Seletor**: `.ProductCard_ProductCard_Installment__XZEnD`
- **Atributo adicional**: `data-testid="product-card::installment"`
- Exemplo:
  ```html
  <span class="Text_Text__ARJdp Text_MobileLabelXs__dHwGG Text_MobileLabelSAtLarge__m0whD ProductCard_ProductCard_Installment__XZEnD" data-testid="product-card::installment">
      até 10x de R$ 639,90
  </span>
  ```

---


### 8. **Review Summary**
- **Finalidade**: Contém informações sobre prós e contras.
- **Seletor**: `.ReviewSummary_ReviewSummary__gYw_V`
- Exemplo:
  ```html
  <span class="Text_Text__ARJdp Text_DesktopLabelXs__cMRcB ReviewSummary_ReviewSummary_Link__kKgbL">4 Prós e 3 Contras</span>
  ```
