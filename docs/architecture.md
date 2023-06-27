# Architecture

---

This is automatically generated template by TechDocs.

**Please fill your documentation here!**

---

Don't know where to start?

_Option 1_: Use the [Architecture Concept Document (ACD) Template](https://github.wdf.sap.corp/DevProcess-Architecture/ArchitectureConceptDocument/blob/master/T411%20Architecture%20Concept%20Document-v4.0.md)

_Option 2_: Directly start describing your architecture as code using [Mermaid](https://mermaid-js.github.io/mermaid/#/)

> Mermaid lets you create diagrams and visualizations using text and code.
> It is a JavaScript based diagramming and charting tool that renders Markdown-inspired text definitions to create and modify diagrams dynamically.

## Flowchart

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

## Sequence diagram

```mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
```

## Class diagram

```mermaid
classDiagram
Class01 <|-- AveryLongClass : Cool
Class03 *-- Class04
Class05 o-- Class06
Class07 .. Class08
Class09 --> C2 : Where am i?
Class09 --* C3
Class09 --|> Class07
Class07 : equals()
Class07 : Object[] elementData
Class01 : size()
Class01 : int chimp
Class01 : int gorilla
Class08 <--> C2: Cool label
```

Explore it in the [live editor](https://mermaid.live/)
