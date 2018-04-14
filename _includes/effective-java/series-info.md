{% include effective-java/disclaimer.html %}

Ten wpis nawiązuje do tematu z *{{ include.item }}* z rozdziału:

{% case include.chapter %}

{% when "Chapter 2" %}

{: .m0}
Creating and Destroying Objects

- [Item 1: Consider static factory methods instead of constructors]({% post_url /Effective-Java/2018-04-14-static-method-factory-zamiast-konstruktora %}){: #Item-1}
- [Item 2: Consider a builder when faced with many constructor parameters](){: .disabled #Item-2}
- [Item 3: Enforce the singleton property with a private constructor or an enum type](){: .disabled #Item-3}
- [Item 4: Enforce noninstantiability with a private constructor](){: .disabled #Item-4}
- [Item 5: Prefer dependency injection to hardwiring resources](){: .disabled #Item-5}
- [Item 6: Avoid creating unnecessary objects](){: .disabled #Item-6}
- [Item 7: Eliminate obsolete object references](){: .disabled #Item-7}
- [Item 8: Avoid finalizers and cleaners](){: .disabled #Item-8}
- [Item 9: Prefer try-with-resources to try-finally](){: .disabled #Item-9}

{% when "Chapter 3" %}

{: .m0}
Methods Common to All Objects

- [Item 10: Obey the general contract when overriding equals](){: #Item-10}
- [Item 11: Always override hashCode when you override equals](){: .disabled #Item-11}
- [Item 12: Always override toString](){: .disabled #Item-12}
- [Item 13: Override clone judiciously](){: .disabled #Item-13}
- [Item 14: Consider implementing Comparable](){: .disabled #Item-14}

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