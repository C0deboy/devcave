---
layout:     post
titleSEO:	  "Rozważne używanie streamów"
title:      "Rozważne używanie streamów"
subtitle:   ""
date:       2018-12-01 8:00:00
author:     "Codeboy"
category:   Effective-Java
tags:	      Notatnik-Juniora Dobre-praktyki Java Effective-Java
comments:   true
toc:        true
chapter:    7
item:       47, 48
---

{% include effective-java/series-info.html %}

# Item 47: Prefer Collection to Stream as a return type

Many methods return sequences of elements. Prior to Java 8, the obvious return types for such methods were the collection interfaces Collection, Set, and List; Iterable; and the array types. Usually, it was easy to decide which of these types to return. The norm was a collection interface. If the method existed solely to enable for-each loops or the returned sequence couldn’t be made to implement some Collection method (typically, contains(Object)), the Iterable interface was used. If the returned elements were primitive values or there were stringent performance requirements, arrays were used. In Java 8, streams were added to the platform, substantially complicating the task of choosing the appropriate return type for a sequence-returning method.

You may hear it said that streams are now the obvious choice to return a sequence of elements, but as discussed in Item 45, streams do not make iteration obsolete: writing good code requires combining streams and iteration judiciously. If an API returns only a stream and some users want to iterate over the returned sequence with a for-each loop, those users will be justifiably upset. It is especially frustrating because the Stream interface contains the sole abstract method in the Iterable interface, and Stream’s specification for this method is compatible with Iterable’s. The only thing preventing programmers from using a for-each loop to iterate over a stream is Stream’s failure to extend Iterable.

Sadly, there is no good workaround for this problem. At first glance, it might appear that passing a method reference to Stream’s iterator method would work. The resulting code is perhaps a bit noisy and opaque, but not unreasonable:

```java
// Won't compile, due to limitations on Java's type inference
for (ProcessHandle ph : ProcessHandle.allProcesses()::iterator) {
    // Process the process
}
```

Unfortunately, if you attempt to compile this code, you’ll get an error message:

```java
Test.java:6: error: method reference not expected here
for (ProcessHandle ph : ProcessHandle.allProcesses()::iterator) {
                        ^
```

In order to make the code compile, you have to cast the method reference to an appropriately parameterized Iterable:

```java
// Hideous workaround to iterate over a stream
for  (ProcessHandle ph : (Iterable<ProcessHandle>)
                        ProcessHandle.allProcesses()::iterator)

This client code works, but it is too noisy and opaque to use in practice. A better workaround is to use an adapter method. The JDK does not provide such a method, but it’s easy to write one, using the same technique used in-line in the snippets above. Note that no cast is necessary in the adapter method because Java’s type inference works properly in this context:

```java
// Adapter from  Stream<E> to Iterable<E>
public static <E> Iterable<E> iterableOf(Stream<E> stream) {
    return stream::iterator;
}
```

With this adapter, you can iterate over any stream with a for-each statement:

```java
for (ProcessHandle p : iterableOf(ProcessHandle.allProcesses())) {
    // Process the process
}
```

Note that the stream versions of the Anagrams program in Item 34 use the Files.lines method to read the dictionary, while the iterative version uses a scanner. The Files.lines method is superior to a scanner, which silently swallows any exceptions encountered while reading the file. Ideally, we would have used Files.lines in the iterative version too. This is the sort of compromise that programmers will make if an API provides only stream access to a sequence and they want to iterate over the sequence with a for-each statement.

Conversely, a programmer who wants to process a sequence using a stream pipeline will be justifiably upset by an API that provides only an Iterable. Again the JDK does not provide an adapter, but it’s easy enough to write one:

```java
// Adapter from Iterable<E> to Stream<E>
public static <E> Stream<E> streamOf(Iterable<E> iterable) {
    return StreamSupport.stream(iterable.spliterator(), false);
}
```

If you’re writing a method that returns a sequence of objects and you know that it will only be used in a stream pipeline, then of course you should feel free to return a stream. Similarly, a method returning a sequence that will only be used for iteration should return an Iterable. But if you’re writing a public API that returns a sequence, you should provide for users who want to write stream pipelines as well as those who want to write for-each statements, unless you have a good reason to believe that most of your users will want to use the same mechanism.

The Collection interface is a subtype of Iterable and has a stream method, so it provides for both iteration and stream access. Therefore, Collection or an appropriate subtype is generally the best return type for a public, sequence-returning method. Arrays also provide for easy iteration and stream access with the Arrays.asList and Stream.of methods. If the sequence you’re returning is small enough to fit easily in memory, you’re probably best off returning one of the standard collection implementations, such as ArrayList or HashSet. But do not store a large sequence in memory just to return it as a collection.

If the sequence you’re returning is large but can be represented concisely, consider implementing a special-purpose collection. For example, suppose you want to return the power set of a given set, which consists of all of its subsets. The power set of {a, b, c} is [{}, {a}, {b}, {c}, {a, b}, {a, c}, {b, c}, {a, b, c}]. If a set has n elements, its power set has 2n. Therefore, you shouldn’t even consider storing the power set in a standard collection implementation. It is, however, easy to implement a custom collection for the job with the help of AbstractList.

The trick is to use the index of each element in the power set as a bit vector, where the nth bit in the index indicates the presence or absence of the nth element from the source set. In essence, there is a natural mapping between the binary numbers from 0 to 2n − 1 and the power set of an n-element set. Here’s the code:

```java
// Returns the power set of an input set as custom collection
public class PowerSet {
   public static final <E> Collection<Set<E>> of(Set<E> s) {
      List<E> src = new ArrayList<>(s);
      if (src.size() > 30)
         throw new IllegalArgumentException("Set too big " + s);
      return new AbstractList<Set<E>>() {
         @Override public int size() {
            return 1 << src.size(); // 2 to the power srcSize
         }

         @Override public boolean contains(Object o) {
            return o instanceof Set && src.containsAll((Set)o);
         }

         @Override public Set<E> get(int index) {
            Set<E> result = new HashSet<>();
            for (int i = 0; index != 0; i++, index >>= 1)
               if ((index & 1) == 1)
                  result.add(src.get(i));
            return result;
         }
      };
   }
}
```

Note that PowerSet.of throws an exception if the input set has more than 30 elements. This highlights a disadvantage of using Collection as a return type rather than Stream or Iterable: Collection has an int-returning size method, which limits the length of the returned sequence to Integer.MAX_VALUE, or 231 − 1. The Collection specification does allow the size method to return 231 − 1 if the collection is larger, even infinite, but this is not a wholly satisfying solution.

In order to write a Collection implementation atop AbstractCollection, you need implement only two methods beyond the one required for Iterable: contains and size. Often it’s easy to write efficient implementations of these methods. If it isn’t feasible, perhaps because the contents of the sequence aren’t predetermined before iteration takes place, return a stream or iterable, whichever feels more natural. If you choose, you can return both using two separate methods.

There are times when you’ll choose the return type based solely on ease of implementation. For example, suppose you want to write a method that returns all of the (contiguous) sublists of an input list. It takes only three lines of code to generate these sublists and put them in a standard collection, but the memory required to hold this collection is quadratic in the size of the source list. While this is not as bad as the power set, which is exponential, it is clearly unacceptable. Implementing a custom collection, as we did for the power set, would be tedious, more so because the JDK lacks a skeletal Iterator implementation to help us.

It is, however, straightforward to implement a stream of all the sublists of an input list, though it does require a minor insight. Let’s call a sublist that contains the first element of a list a prefix of the list. For example, the prefixes of (a, b, c) are (a), (a, b), and (a, b, c). Similarly, let’s call a sublist that contains the last element a suffix, so the suffixes of (a, b, c) are (a, b, c), (b, c), and (c). The insight is that the sublists of a list are simply the suffixes of the prefixes (or identically, the prefixes of the suffixes) and the empty list. This observation leads directly to a clear, reasonably concise implementation:

```java
// Returns a stream of all the sublists of its input list
public class SubLists {
   public static <E> Stream<List<E>> of(List<E> list) {
      return Stream.concat(Stream.of(Collections.emptyList()),
         prefixes(list).flatMap(SubLists::suffixes));
   }

   private static <E> Stream<List<E>> prefixes(List<E> list) {
      return IntStream.rangeClosed(1, list.size())
         .mapToObj(end -> list.subList(0, end));
   }

   private static <E> Stream<List<E>> suffixes(List<E> list) {
      return IntStream.range(0, list.size())
         .mapToObj(start -> list.subList(start, list.size()));
   }
}
```

Note that the Stream.concat method is used to add the empty list into the returned stream. Also note that the flatMap method (Item 45) is used to generate a single stream consisting of all the suffixes of all the prefixes. Finally, note that we generate the prefixes and suffixes by mapping a stream of consecutive int values returned by IntStream.range and IntStream.rangeClosed. This idiom is, roughly speaking, the stream equivalent of the standard for-loop on integer indices. Thus, our sublist implementation is similar in spirit to the obvious nested for-loop:

```java
for (int start = 0; start < src.size(); start++)
    for (int end = start + 1; end <= src.size(); end++)
        System.out.println(src.subList(start, end));
```

It is possible to translate this for-loop directly into a stream. The result is more concise than our previous implementation, but perhaps a bit less readable. It is similar in spirit to the streams code for the Cartesian product in Item 45:

```java
// Returns a stream of all the sublists of its input list
public static <E> Stream<List<E>> of(List<E> list) {
   return IntStream.range(0, list.size())
      .mapToObj(start ->
         IntStream.rangeClosed(start + 1, list.size())
            .mapToObj(end -> list.subList(start, end)))
      .flatMap(x -> x);
}
```

Like the for-loop that precedes it, this code does not emit the empty list. In order to fix this deficiency, you could either use concat, as we did in the previous version, or replace 1 by (int) Math.signum(start) in the rangeClosed call.

Either of these stream implementations of sublists is fine, but both will require some users to employ a Stream-to-Iterable adapter or to use a stream in places where iteration would be more natural. Not only does the Stream-to-Iterable adapter clutter up client code, but it slows down the loop by a factor of 2.3 on my machine. A purpose-built Collection implementation (not shown here) is considerably more verbose but runs about 1.4 times as fast as our stream-based implementation on my machine.

In summary, when writing a method that returns a sequence of elements, remember that some of your users may want to process them as a stream while others may want to iterate over them. Try to accommodate both groups. If it’s feasible to return a collection, do so. If you already have the elements in a collection or the number of elements in the sequence is small enough to justify creating a new one, return a standard collection such as ArrayList. Otherwise, consider implementing a custom collection as we did for the power set. If it isn’t feasible to return a collection, return a stream or iterable, whichever seems more natural. If, in a future Java release, the Stream interface declaration is modified to extend Iterable, then you should feel free to return streams because they will allow for both stream processing and iteration.

# Item 48: Use caution when making streams parallel

Among mainstream languages, Java has always been at the forefront of providing facilities to ease the task of concurrent programming. When Java was released in 1996, it had built-in support for threads, with synchronization and wait/notify. Java 5 introduced the java.util.concurrent library, with concurrent collections and the executor framework. Java 7 introduced the fork-join package, a high-performance framework for parallel decomposition. Java 8 introduced streams, which can be parallelized with a single call to the parallel method. Writing concurrent programs in Java keeps getting easier, but writing concurrent programs that are correct and fast is as difficult as it ever was. Safety and liveness violations are a fact of life in concurrent programming, and parallel stream pipelines are no exception.

Consider this program from Item 45:

```java
// Stream-based program to generate the first 20 Mersenne primes
public static void main(String[] args) {
    primes().map(p -> TWO.pow(p.intValueExact()).subtract(ONE))
        .filter(mersenne -> mersenne.isProbablePrime(50))
        .limit(20)
        .forEach(System.out::println);
}

static Stream<BigInteger> primes() {
    return Stream.iterate(TWO, BigInteger::nextProbablePrime);
}
```

On my machine, this program immediately starts printing primes and takes 12.5 seconds to run to completion. Suppose I naively try to speed it up by adding a call to parallel() to the stream pipeline. What do you think will happen to its performance? Will it get a few percent faster? A few percent slower? Sadly, what happens is that it doesn’t print anything, but CPU usage spikes to 90 percent and stays there indefinitely (a liveness failure). The program might terminate eventually, but I was unwilling to find out; I stopped it forcibly after half an hour.

What’s going on here? Simply put, the streams library has no idea how to parallelize this pipeline and the heuristics fail. Even under the best of circumstances, parallelizing a pipeline is unlikely to increase its performance if the source is from Stream.iterate, or the intermediate operation limit is used. This pipeline has to contend with both of these issues. Worse, the default parallelization strategy deals with the unpredictability of limit by assuming there’s no harm in processing a few extra elements and discarding any unneeded results. In this case, it takes roughly twice as long to find each Mersenne prime as it did to find the previous one. Thus, the cost of computing a single extra element is roughly equal to the cost of computing all previous elements combined, and this innocuous-looking pipeline brings the automatic parallelization algorithm to its knees. The moral of this story is simple: Do not parallelize stream pipelines indiscriminately. The performance consequences may be disastrous.

As a rule, performance gains from parallelism are best on streams over ArrayList, HashMap, HashSet, and ConcurrentHashMap instances; arrays; int ranges; and long ranges. What these data structures have in common is that they can all be accurately and cheaply split into subranges of any desired sizes, which makes it easy to divide work among parallel threads. The abstraction used by the streams library to perform this task is the spliterator, which is returned by the spliterator method on Stream and Iterable.

Another important factor that all of these data structures have in common is that they provide good-to-excellent locality of reference when processed sequentially: sequential element references are stored together in memory. The objects referred to by those references may not be close to one another in memory, which reduces locality-of-reference. Locality-of-reference turns out to be critically important for parallelizing bulk operations: without it, threads spend much of their time idle, waiting for data to be transferred from memory into the processor’s cache. The data structures with the best locality of reference are primitive arrays because the data itself is stored contiguously in memory.

The nature of a stream pipeline’s terminal operation also affects the effectiveness of parallel execution. If a significant amount of work is done in the terminal operation compared to the overall work of the pipeline and that operation is inherently sequential, then parallelizing the pipeline will have limited effectiveness. The best terminal operations for parallelism are reductions, where all of the elements emerging from the pipeline are combined using one of Stream’s reduce methods, or prepackaged reductions such as min, max, count, and sum. The short-circuiting operations anyMatch, allMatch, and noneMatch are also amenable to parallelism. The operations performed by Stream’s collect method, which are known as mutable reductions, are not good candidates for parallelism because the overhead of combining collections is costly.

If you write your own Stream, Iterable, or Collection implementation and you want decent parallel performance, you must override the spliterator method and test the parallel performance of the resulting streams extensively. Writing high-quality spliterators is difficult and beyond the scope of this book.

Not only can parallelizing a stream lead to poor performance, including liveness failures; it can lead to incorrect results and unpredictable behavior (safety failures). Safety failures may result from parallelizing a pipeline that uses mappers, filters, and other programmer-supplied function objects that fail to adhere to their specifications. The Stream specification places stringent requirements on these function objects. For example, the accumulator and combiner functions passed to Stream’s reduce operation must be associative, non-interfering, and stateless. If you violate these requirements (some of which are discussed in Item 46) but run your pipeline sequentially, it will likely yield correct results; if you parallelize it, it will likely fail, perhaps catastrophically.

Along these lines, it’s worth noting that even if the parallelized Mersenne primes program had run to completion, it would not have printed the primes in the correct (ascending) order. To preserve the order displayed by the sequential version, you’d have to replace the forEach terminal operation with forEachOrdered, which is guaranteed to traverse parallel streams in encounter order.

Even assuming that you’re using an efficiently splittable source stream, a parallelizable or cheap terminal operation, and non-interfering function objects, you won’t get a good speedup from parallelization unless the pipeline is doing enough real work to offset the costs associated with parallelism. As a very rough estimate, the number of elements in the stream times the number of lines of code executed per element should be at least a hundred thousand [Lea14].

It’s important to remember that parallelizing a stream is strictly a performance optimization. As is the case for any optimization, you must test the performance before and after the change to ensure that it is worth doing (Item 67). Ideally, you should perform the test in a realistic system setting. Normally, all parallel stream pipelines in a program run in a common fork-join pool. A single misbehaving pipeline can harm the performance of others in unrelated parts of the system.

If it sounds like the odds are stacked against you when parallelizing stream pipelines, it’s because they are. An acquaintance who maintains a multimillion-line codebase that makes heavy use of streams found only a handful of places where parallel streams were effective. This does not mean that you should refrain from parallelizing streams. Under the right circumstances, it is possible to achieve near-linear speedup in the number of processor cores simply by adding a parallel call to a stream pipeline. Certain domains, such as machine learning and data processing, are particularly amenable to these speedups.

As a simple example of a stream pipeline where parallelism is effective, consider this function for computing π(n), the number of primes less than or equal to n:

```java
// Prime-counting stream pipeline - benefits from parallelization
static long pi(long n) {
    return LongStream.rangeClosed(2, n)
        .mapToObj(BigInteger::valueOf)
        .filter(i -> i.isProbablePrime(50))
        .count();
}

On my machine, it takes 31 seconds to compute π(108) using this function. Simply adding a parallel() call reduces the time to 9.2 seconds:

// Prime-counting stream pipeline - parallel version
static long pi(long n) {
    return LongStream.rangeClosed(2, n)
        .parallel()
        .mapToObj(BigInteger::valueOf)
        .filter(i -> i.isProbablePrime(50))
        .count();
}
```

In other words, parallelizing the computation speeds it up by a factor of 3.7 on my quad-core machine. It’s worth noting that this is not how you’d compute π(n) for large values of n in practice. There are far more efficient algorithms, notably Lehmer’s formula.

If you are going to parallelize a stream of random numbers, start with a SplittableRandom instance rather than a ThreadLocalRandom (or the essentially obsolete Random). SplittableRandom is designed for precisely this use, and has the potential for linear speedup. ThreadLocalRandom is designed for use by a single thread, and will adapt itself to function as a parallel stream source, but won’t be as fast as SplittableRandom. Random synchronizes on every operation, so it will result in excessive, parallelism-killing contention.

In summary, do not even attempt to parallelize a stream pipeline unless you have good reason to believe that it will preserve the correctness of the computation and increase its speed. The cost of inappropriately parallelizing a stream can be a program failure or performance disaster. If you believe that parallelism may be justified, ensure that your code remains correct when run in parallel, and do careful performance measurements under realistic conditions. If your code remains correct and these experiments bear out your suspicion of increased performance, then and only then parallelize the stream in production code.