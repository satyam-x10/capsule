import { Capsule } from '../types/capsule';

export const capsules: Capsule[] = [
  // =============================================================
  // SECTION: AI & ML
  // =============================================================
  {
    id: 'ai-transformer-attention',
    category: 'AI & ML',
    title: 'Transformer Attention Mechanics: Query, Key, Value',
    shortDescription: 'Unveiling the mathematical operations behind the self-attention mechanism in modern Large Language Models.',
    content: 'At the heart of the Transformer architecture lies the self-attention mechanism, which allows tokens in a sequence to dynamically weigh their relationships with all other tokens. Unlike traditional RNNs that process tokens sequentially, Transformers process entire sequences in parallel, computing context-rich representations.\n\nThis process is formulated using Queries (Q), Keys (K), and Values (V) vectors. For a given token, its Query vector represents "what I am looking for." The Key vectors of other tokens represent "what I contain," and their Value vectors represent "what information I actually hold."\n\nFirst, we compute the similarity between a query and all keys using a dot product: Q * K^T. To prevent the gradients of the softmax function from vanishing at large values, we scale the dot products by dividing by the square root of the dimension of the key vectors (sqrt(d_k)). We then apply the softmax function to obtain attention weights (probabilities) and multiply these weights by the Value vectors (V). The resulting output is a weighted sum of the values, summarizing the context of the sequence for each token: Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V.',
    takeaway: 'Self-attention maps a query and a set of key-value pairs to an output. Scaling by sqrt(d_k) is mathematically critical to maintain stable gradients during backpropagation.',
    readTime: '3 min read',
    date: '2026-05-27'
  },
  {
    id: 'ai-rag-mechanics',
    category: 'AI & ML',
    title: 'Retrieval-Augmented Generation (RAG) Architecture',
    shortDescription: 'How to bypass context window limitations and prevent model hallucinations using vector searches.',
    content: 'Large Language Models (LLMs) are frozen in time after training and suffer from "hallucinations"—generating factually incorrect statements with high confidence. Retrieval-Augmented Generation (RAG) resolves these issues by hooking up the LLM to an external knowledge source.\n\nWhen a user submits a query, it is first converted into a vector representation (embedding) using an embedding model. This embedding is used to perform a similarity search (like cosine distance) against a Vector Database (e.g., Pinecone, pgvector) containing chunked document embeddings.\n\nThe vector database retrieves the top-K most similar text chunks. These chunks are then prepended as "ground truth context" directly into the user\'s prompt template. The LLM reads the context and answers the query based strictly on the retrieved source material, guaranteeing freshness and traceability.',
    takeaway: 'RAG shifts LLM reliance from parametric memory (built-in knowledge) to non-parametric memory (external search database), eliminating hallucinations and enabling real-time document interaction.',
    readTime: '4 min read',
    date: '2026-05-26'
  },
  {
    id: 'ai-quantization',
    category: 'AI & ML',
    title: 'Model Quantization: FP16 to INT8 conversion',
    shortDescription: 'Exploring memory footprint reduction techniques for serving massive neural networks on edge devices.',
    content: 'Deep learning models are typically trained using FP32 (32-bit single-precision floating-point) weights to maintain gradient fidelity. However, serving a model with billions of parameters in FP32 is computationally expensive and memory-prohibitive. Model Quantization reduces the precision of weights and activations to lower-precision formats like INT8 or FP16.\n\nBy mapping the continuous range of floating-point values to discrete integer buckets (e.g., mapping [-3.2, 4.5] to [-128, 127]), quantization shrinks memory storage by 4x and accelerates inference. Runtimes can utilize high-performance integer ALU hardware instructions (like DP4A or tensor cores) which execute significantly faster than floating-point math.\n\nQuantization can be Post-Training (PTQ), where calibration datasets determine optimal scale factors, or Quantization-Aware Training (QAT), where weight rounding is simulated during training, allowing the model to adapt and recover accuracy losses.',
    takeaway: 'Quantization trades a tiny fraction of model accuracy for substantial gains in inference speed, reduced memory bandwidth, and the ability to run LLMs on consumer-grade hardware.',
    readTime: '3 min read',
    date: '2026-05-25'
  },

  // =============================================================
  // SECTION: Data Structures & Algorithms
  // =============================================================
  {
    id: 'dsa-btrees',
    category: 'Data Structures & Algorithms',
    title: 'B-Trees: Optimizing Disk Block Accesses',
    shortDescription: 'Why database index engines prioritize wide, shallow B-Trees over deep binary search trees.',
    content: 'Standard Binary Search Trees (BSTs) are memory-efficient, but their height scales as O(log2 N). If a database index of 10 million rows were stored in a BST, a search would require up to 24 lookups. On mechanical drives or SSDs, where disk seeks are orders of magnitude slower than CPU cache access, 24 random page reads is a massive bottleneck.\n\nA B-Tree is a self-balancing search tree designed to optimize block-based storage. B-Trees are short and wide. Each node contains multiple sorted keys and child pointers (often hundreds, corresponding to disk page sizes like 4KB).\n\nBecause the branching factor B is large (e.g., B=512), the tree remains incredibly shallow. A 3-level B-Tree can store millions of keys. Searching requires reading only 3 disk blocks, drastically reducing I/O wait times. Leaf nodes in B+ Trees are also linked sequentially, making range queries exceptionally fast.',
    takeaway: 'B-Trees minimize disk I/O operations by matching node sizes directly with hardware disk pages, keeping the index layout wide, sorted, and shallow.',
    readTime: '3 min read',
    date: '2026-05-27'
  },
  {
    id: 'dsa-bloom-filters',
    category: 'Data Structures & Algorithms',
    title: 'Bloom Filters: Probabilistic Bit Arrays',
    shortDescription: 'How to check if an element exists in a set in O(1) time and zero storage overhead.',
    content: 'A Bloom filter is a space-efficient, probabilistic data structure used to test set membership. It answers a simple question: "Is this username taken?" or "Is this URL in our malicious URL database?"\n\nIt consists of a bit array of size M, initialized to 0, and K independent hash functions. To add an element, we hash it K times, obtaining K indices, and set those bits to 1. To query an element, we hash it K times and check if all those bits are 1.\n\nIf any bit is 0, the element is definitely not in the set (zero false negatives). If all bits are 1, the element is *probably* in the set, but there is a chance of a "false positive" due to hash collisions. We trade 100% accuracy for O(1) checks and near-zero memory footprint.',
    takeaway: 'Bloom filters provide space-saving membership tests with zero false negatives. Use them to guard expensive disk reads by quickly checking if a key does NOT exist.',
    readTime: '3 min read',
    date: '2026-05-26'
  },
  {
    id: 'dsa-lru-cache',
    category: 'Data Structures & Algorithms',
    title: 'LRU Cache: HashMap and Doubly-Linked List Integration',
    shortDescription: 'The exact structural components required to achieve O(1) read, write, and evict times.',
    content: 'A Least Recently Used (LRU) cache discards the least recently accessed items first when it runs out of memory. Designing an LRU cache requires three operations to run in constant time O(1): Lookup, Insertion, and Eviction.\n\nA Hash Map provides O(1) lookup but has no concept of order. A Linked List tracks ordering (nodes are appended to the tail when accessed and removed from the head when evicted), but finding a node is O(N).\n\nBy integrating them—storing a Doubly-Linked List alongside a Hash Map where the map keys point directly to list nodes—we get the best of both. When a key is requested, we pull it from the map in O(1) and shift its node to the tail of the list in O(1). Eviction removes the head node of the list and deletes its key from the map.',
    takeaway: 'LRU caching leverages a hybrid structure: a Doubly-Linked List coordinates insertion order while a Hash Map maps keys directly to list references, achieving true O(1) complexity.',
    readTime: '3 min read',
    date: '2026-05-25'
  },

  // =============================================================
  // SECTION: System Design
  // =============================================================
  {
    id: 'sys-vector-clocks',
    category: 'System Design',
    title: 'Vector Clocks: Establishing Causal Time',
    shortDescription: 'Resolving write conflicts in distributed stores without synchronized hardware clocks.',
    content: 'In distributed databases like DynamoDB or Cassandra, write requests hit different replicas concurrently. Relying on physical computer clocks (NTP) to determine the order of writes leads to data loss, because server clocks drift. Vector Clocks establish causal relationships without physical time.\n\nEach node maintains a vector (an array of counters) of size N (number of nodes). When a node performs a write, it increments its own counter in its vector clock. When passing data, the clock is attached.\n\nWhen node A receives data from node B, it merges vectors by taking the maximum of each element. If vector X has all components greater than or equal to vector Y, X causally succeeded Y (we overwrite Y). If some elements are greater in X and others in Y, a conflict has occurred and must be resolved by the application.',
    takeaway: 'Vector clocks allow concurrent actors to determine causal ordering. They detect write conflicts, passing execution branches back to developers to resolve.',
    readTime: '4 min read',
    date: '2026-05-27'
  },
  {
    id: 'sys-raft-consensus',
    category: 'System Design',
    title: 'Raft Consensus: Leader Election Protocol',
    shortDescription: 'How distributed nodes elect a single source of truth during partition failures.',
    content: 'Consistent distributed databases need consensus. Raft simplifies this by separating state agreement into subtasks, starting with Leader Election. A node exists in one of three states: Follower, Candidate, or Leader.\n\nFollowers expect periodic heartbeats from the Leader. If a follower detects a timeout, it transitions to a Candidate, increments the "term" counter, votes for itself, and broadcasts RequestVote RPCs.\n\nNodes grant votes only if the candidate\'s log is at least as up-to-date as their own. If a candidate receives votes from a majority of nodes, it becomes the Leader. If a network partition occurs, the side with the majority elects a leader, while the minority side remains idle, avoiding split-brain writes.',
    takeaway: 'Raft enforces quorum (majority consensus) to elect leaders. The candidate with the most complete log wins, preventing stale state machines from overriding committed writes.',
    readTime: '4 min read',
    date: '2026-05-26'
  },
  {
    id: 'sys-cqrs-architecture',
    category: 'System Design',
    title: 'CQRS and Event Sourcing: High-Throughput Writes',
    shortDescription: 'Decoupling read and write databases to bypass table locking and transactional overhead.',
    content: 'In standard SQL databases, executing complex reports lock tables, slowing down client write transactions. Command Query Responsibility Segregation (CQRS) separates data modifications (Commands) from reads (Queries).\n\nWrites are handled by a write database optimized for insertion integrity. Reads pull from a read database optimized for search queries (like Elasticsearch). Synchronization happens asynchronously.\n\nWhen combined with Event Sourcing, instead of storing the current state, the database stores the sequence of events (e.g. "Item Added", "Item Checked Out"). The read database plays these events sequentially to construct cached views, yielding extreme write speeds.',
    takeaway: 'CQRS segregates the database schema. While introducing eventual consistency, it enables independent scaling of read-replicas and write transaction layers.',
    readTime: '4 min read',
    date: '2026-05-25'
  },

  // =============================================================
  // SECTION: Database Internals
  // =============================================================
  {
    id: 'db-lsm-vs-btree-internals',
    category: 'Database Internals',
    title: 'LSM-Trees vs B-Trees: Read vs Write Tradeoffs',
    shortDescription: 'Analyzing database layouts: sequential log-structured appends vs random in-place page writes.',
    content: 'Database engines choose layouts based on hardware profiles. B-Trees use in-place updates. When a row changes, the engine locates the database page containing the row, updates the bytes in memory, and eventually flushes the page back to disk.\n\nThis makes B-Trees ideal for reads, but writes require random disk seeks and write amplification. LSM-Trees (Log-Structured Merge-Trees) use append-only writes. Modifications are written to an in-memory sorted MemTable and a sequential log (WAL).\n\nWhen the MemTable fills, it flushes to disk as an immutable Sorted String Table (SSTable). Background compactions run Merge-Sort to merge SSTables, delete duplicates, and handle removals. Writes are sequential, which maximizes SSD throughput.',
    takeaway: 'LSM-Trees optimize for write throughput by converting random writes to sequential writes. B-Trees optimize for reads, preventing read amplification.',
    readTime: '3 min read',
    date: '2026-05-27'
  },
  {
    id: 'db-write-ahead-logging',
    category: 'Database Internals',
    title: 'Write-Ahead Logging (WAL) and Crash Recovery',
    shortDescription: 'How database engines guarantee ACID durability in the face of sudden power failures.',
    content: 'Flushing updated database blocks (pages) to disk is slow. To prevent latency, database engines update pages in memory (buffer cache) first. However, if power drops, these "dirty pages" are lost. Write-Ahead Logging (WAL) resolves this.\n\nBefore modifying database states on disk, the details of the transaction (e.g. "Set balance of key X to 100") must be appended to an append-only log file on non-volatile disk. This write is fast because it is sequential and doesn\'t require random page seeks.\n\nOnce the WAL is flushed, the transaction commits. If the server crashes, the engine scans the WAL during startup, "replaying" updates that were committed but not written to the data files, and "rolling back" incomplete writes.',
    takeaway: 'Write-Ahead Logging ensures Durability. Databases commit transactions as soon as the sequential WAL is flushed, postponing expensive page writes for background processing.',
    readTime: '3 min read',
    date: '2026-05-26'
  },
  {
    id: 'db-mvcc-concurrency',
    category: 'Database Internals',
    title: 'Multi-Version Concurrency Control (MVCC) Mechanics',
    shortDescription: 'How modern RDBMS engines allow readers to execute without blocking writers.',
    content: 'In early databases, to guarantee isolation, a writer transaction would lock rows, blocking all concurrent readers. Multi-Version Concurrency Control (MVCC) solves this by treating rows as versioned histories rather than single values.\n\nWhen a transaction updates a row, the database does not overwrite the existing data. Instead, it creates a new version of the row, linking it to the transaction\'s transaction ID (txid).\n\nWhen a reader transaction starts, the database determines which transaction IDs were committed at that moment. The reader traverses row versions, reading only the latest version that was committed before its read snapshot started. Writers write to new versions, ensuring readers are never blocked.',
    takeaway: 'MVCC implements the database maxim: "Readers do not block writers, and writers do not block readers," by keeping historical snapshots of modified rows.',
    readTime: '4 min read',
    date: '2026-05-25'
  },

  // =============================================================
  // SECTION: Web Performance & Networking
  // =============================================================
  {
    id: 'net-tcp-bbr-congestion',
    category: 'Web Performance & Networking',
    title: 'TCP BBR: Modelling Bandwidth-Delay Product',
    shortDescription: 'Google\'s congestion control algorithm that optimizes throughput by bypassing packet drop heuristics.',
    content: 'Traditional TCP congestion algorithms (Cubic, Reno) use packet loss as a primary signal of congestion. In modern networks with large buffer lines (bufferbloat) or noisy wireless environments, this loss heuristic fails, cutting transmission speeds prematurely or overloading routers.\n\nGoogle\'s BBR (Bottleneck Bandwidth and RTT) models the physical channel. It tracks the maximum bandwidth of the slowest link and the minimum round-trip propagation time of the path.\n\nBy ensuring the total data in flight equals the Bandwidth-Delay Product (BDP = Max Bandwidth * Min RTT), BBR pumps data at the exact capacity of the network line, maximizing delivery speeds while minimizing queue delay and buffer overflows.',
    takeaway: 'BBR avoids congestion by keeping transmission rates synchronized with the physical limits of the network pipe, yielding latency benefits on modern paths.',
    readTime: '3 min read',
    date: '2026-05-27'
  },
  {
    id: 'net-http3-quic-multiplexing',
    category: 'Web Performance & Networking',
    title: 'HTTP/3: Eliminating Transport Head-of-Line Blocking',
    shortDescription: 'How moving from TCP to UDP-based QUIC allows streams to fail independently.',
    content: 'HTTP/2 introduced single-connection multiplexing, allowing multiple files to be fetched concurrently. However, because TCP treats the connection as a single, in-order sequence of bytes, a single packet drop halts delivery of all files until the lost packet is retransmitted.\n\nHTTP/3 solves this by replacing TCP with QUIC, a protocol built on top of UDP. QUIC handles stream isolation at the transport layer.\n\nIf a packet belonging to Stream A is lost, only Stream A is paused. Stream B, C, and D continue streaming to the application. QUIC also integrates TLS 1.3 encryption directly into the handshake, establishing connections in 1 RTT, and supports connection migration.',
    takeaway: 'HTTP/3 uses UDP-based QUIC to isolate multiplexed streams, ensuring that packet loss on one resource does not stall the download of others.',
    readTime: '3 min read',
    date: '2026-05-26'
  },
  {
    id: 'net-tls-handshake',
    category: 'Web Performance & Networking',
    title: 'TLS 1.3 Handshake: Speeding Up Web Encryption',
    shortDescription: 'How TLS 1.3 reduces cryptographic setup overhead from two round trips to a single RTT.',
    content: 'Connecting to a secure website over HTTPS requires a TLS handshake to negotiate cryptographic keys. In TLS 1.2, this handshake required two full network round trips (2-RTT) before any application data could be sent, adding noticeable latency.\n\nTLS 1.3 optimizes this by combining key exchange and handshake negotiation. During the first client hello, the client preemptively sends a list of supported cipher suites and key share guesses.\n\nThe server selects the cipher, computes the shared secret, and returns its public key share in the server hello, completing the handshake in exactly one round trip (1-RTT). For repeat visitors, TLS 1.3 supports 0-RTT session resumption, transmitting encrypted data alongside the client hello.',
    takeaway: 'TLS 1.3 shaves one round trip off connection times by combining key negotiations, accelerating web application load times across cellular connections.',
    readTime: '3 min read',
    date: '2026-05-25'
  }
];
