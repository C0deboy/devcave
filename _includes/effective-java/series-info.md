{% include effective-java/disclaimer.html %}

Ten wpis nawiązuje do *{{ include.item }}* z:

{% case include.chapter %}

{% when "Chapter 2" %}

Chapter 2. Creating and Destroying Objects
- [Item 1: Consider static factory methods instead of constructors](/notatnik-juniora/metoda-statycznej-fabryk-zamiast-konstruktora){: #Item-1}
- [Item 2: Consider a builder when faced with many constructor parameters](/notatnik-juniora/wzorzec-projektowy-builder){: #Item-2}
- [Item 3: Enforce the singleton property with a private constructor or an enum type](/notatnik-juniora/wzorzec-projektowy-singleton){: #Item-3}
- [Item 4: Enforce noninstantiability with a private constructor]({{ site.url }}){: .disabled #Item-4}
- [Item 5: Prefer dependency injection to hardwiring resources]({{ site.url }}){: .disabled #Item-5}
- [Item 6: Avoid creating unnecessary objects]({{ site.url }}){: .disabled #Item-6}
- [Item 7: Eliminate obsolete object references]({{ site.url }}){: .disabled #Item-7}
- [Item 8: Avoid finalizers and cleaners]({{ site.url }}){: .disabled #Item-8}
- [Item 9: Prefer try-with-resources to try-finally]({{ site.url }}){: .disabled #Item-9}

{% when "Chapter 3" %}

Chapter 3. Methods Common to All Objects
- [Item 10: Obey the general contract when overriding equals]({{ site.url }}/notatnik-juniora/overriding-equals){: #Item-10}
- [Item 11: Always override hashCode when you override equals]({{ site.url }}){: .disabled #Item-11}
- [Item 12: Always override toString]({{ site.url }}){: .disabled #Item-11}
- [Item 13: Override clone judiciously]({{ site.url }}){: .disabled #Item-5}
- [Item 14: Consider implementing Comparable]({{ site.url }}){: .disabled #Item-6}

{% else %}
NULL

{% endcase %}

<script>
    const link = document.getElementById('{{ include.item }}');
    link.parentElement.parentElement.classList.add('fa-ul', 'custom');
    link.parentElement.style.listStyleType = 'none';
    const i = document.createElement('i');
    i.classList.add('fa-li', 'fa', 'fa-arrow-right');
    link.insertBefore(i, link.firstChild);
</script>

<hr>