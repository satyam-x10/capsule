import { Capsule } from '../types/capsule';

export const capsules: Capsule[] = [
  // -------------------------------------------------------------
  // DATE: 2026-05-27
  // -------------------------------------------------------------
  {
    id: 'db-lsm-vs-btree',
    category: 'Database Internals',
    title: 'LSM-Trees vs B-Trees: The Storage Engine Tradeoff',
    shortDescription: 'Why modern write-heavy systems choose Log-Structured Merge-trees over traditional B-trees.',
    content: 'At the heart of database systems lie storage engines, which dictate how data is written to and read from disk. The two dominant layout structures are B-Trees and Log-Structured Merge-Trees (LSM-Trees). B-Trees write data in-place to fixed-size pages (typically 4KB). While this enables highly efficient O(log N) random reads, it incurs heavy write amplification because updating even a single byte requires writing the entire page back to disk.\n\nLSM-Trees trade read latency for write throughput. Instead of writing in-place, writes are appended to an in-memory buffer (MemTable) and a sequential Write-Ahead Log (WAL). When the MemTable fills, it is flushed to disk as a sorted, immutable SSTable (Sorted String Table). Over time, background processes run compaction (Merge Sort) to consolidate keys and reclaim space.\n\nBecause SSTable writes are sequential, LSM-Trees excel at random write throughput, avoiding random disk seeks. However, reads may require checking multiple SSTables (mitigated by Bloom filters), leading to "read amplification".',
    takeaway: 'Choose B-Trees for read-heavy workloads with strict query latency requirements. Choose LSM-Trees for write-heavy workloads where sequential write bandwidth is the bottleneck.',
    readTime: '3 min read',
    date: '2026-05-27'
  },
  {
    id: 'dist-logical-clocks',
    category: 'Distributed Systems',
    title: 'Vector Clocks: Ordering Events Without Physical Time',
    shortDescription: 'How distributed nodes establish causal relationships when physical clocks cannot be trusted.',
    content: 'In distributed systems, physical clocks drift due to network latency, thermal variance, and hardware imperfections. Thus, relying on physical timestamps to order events (e.g., "did transaction A happen before B?") leads to split-brain scenarios and data loss. Leslie Lamport introduced Logical Clocks to track the causal order of events without absolute physical time.\n\nWhile Lamport clocks assign a single counter to order events, they cannot distinguish between causally dependent events and concurrent ones. Vector Clocks solve this. A vector clock for a system of N nodes is an array of N logical clocks. Each node maintains its own copy of the vector.\n\nWhen a node performs internal work, it increments its own counter in the vector. When it sends a message, it includes its vector clock. Upon receiving a message, the recipient merges the incoming vector with its own by taking the element-wise maximum and increments its own counter. By comparing two vector clocks, a node can determine if one event causally preceded the other, or if they occurred concurrently, allowing application-level conflict resolution.',
    takeaway: 'Vector clocks allow distributed systems to establish causality and detect concurrent updates (conflicts) without relying on synchronized physical hardware clocks.',
    readTime: '4 min read',
    date: '2026-05-27'
  },
  {
    id: 'net-tcp-bbr',
    category: 'Computer Networks',
    title: 'TCP BBR: Congestion Control Redefined',
    shortDescription: 'How Googles Bottleneck Bandwidth and RTT algorithm outperforms packet-loss-based congestion engines.',
    content: 'Traditional TCP congestion control algorithms like Reno and Cubic rely on packet loss as a signal of network congestion. They operate on a simple heuristic: increase transmission speed until a packet is dropped, then drastically cut the sending rate. In modern networks, this leads to "bufferbloat"—where routers cache packets in large buffers, increasing round-trip time (RTT) without dropping packets until the buffers overflow.\n\nGoogle developed BBR (Bottleneck Bandwidth and RTT) to solve this. Instead of waiting for packet loss, BBR models the physical network path. It continuously measures two metrics: the maximum bandwidth of the bottleneck link and the minimum round-trip time of the path.\n\nBy keeping the amount of data in flight equal to the product of bandwidth and RTT (the Bandwidth-Delay Product, or BDP), BBR achieves maximum throughput with minimal queue delay. It operates at the optimal point of the network path, preventing packet loss and bufferbloat altogether, which makes it particularly resilient against random, non-congestive packet loss on wireless networks.',
    takeaway: 'BBR changes congestion control from reactive loss recovery to active modeling of the network pipe, yielding higher throughput and lower latency over lossy, high-latency connections.',
    readTime: '3 min read',
    date: '2026-05-27'
  },
  {
    id: 'web-http3-quic',
    category: 'Web Performance',
    title: 'HTTP/3 and the Death of Head-of-Line Blocking',
    shortDescription: 'How shifting from TCP to UDP-based QUIC fixes the performance bottlenecks of HTTP/2 multiplexing.',
    content: 'HTTP/2 introduced stream multiplexing, allowing a client to request multiple resources (HTML, CSS, JS) over a single TCP connection. This solved the problem of browser connection limits. However, it introduced a new issue: TCP-level Head-of-Line (HOL) blocking. Since TCP guarantees in-order delivery, if a single packet belonging to one resource is lost, the operating system pauses delivery of all other streams until the lost packet is retransmitted.\n\nHTTP/3 solves this by replacing TCP with QUIC, a transport layer protocol built on top of UDP. QUIC moves stream multiplexing from the application layer down to the transport layer. In QUIC, each stream is independent.\n\nIf a packet belonging to Stream A is lost, only Stream A is blocked. Stream B and Stream C continue delivering data to the application layer uninterrupted. In addition, QUIC integrates TLS 1.3 encryption directly into the handshake, reducing connection establishment from 2-3 round trips to just 1 (or even 0 on reconnects), and supports seamless connection migration when switching from Wi-Fi to cellular data.',
    takeaway: 'By using UDP-based QUIC, HTTP/3 eliminates TCP head-of-line blocking, accelerates TLS handshakes, and provides robust connection migration for mobile users.',
    readTime: '3 min read',
    date: '2026-05-27'
  },

  // -------------------------------------------------------------
  // DATE: 2026-05-26
  // -------------------------------------------------------------
  {
    id: 'arch-cqrs',
    category: 'Architecture',
    title: 'CQRS: Decoupling Read and Write Models',
    shortDescription: 'Command Query Responsibility Segregation and when to apply it for high-scale systems.',
    content: 'In traditional CRUD architectures, the same database model is used to create, update, and read data. While simple, this creates conflict as applications scale. A write model requires normalization to ensure transactional integrity (consistency, constraints), while a read model requires denormalization (joins, aggregations) to maximize query performance.\n\nCQRS (Command Query Responsibility Segregation) separates these concerns into two distinct pathways: Commands (writes) and Queries (reads). Commands perform state mutations and return no data (other than success/failure). Queries retrieve data and perform no state modifications.\n\nThis separation allows you to optimize each database representation independently. For instance, writes can target a highly normalized PostgreSQL schema, while reads pull from a read-replica, an Elasticsearch cluster, or pre-computed Redis caches. State synchronization is typically handled asynchronously via an event bus (eventual consistency).',
    takeaway: 'CQRS decouples the operational model from the presentation model. Use it when read and write workloads have drastically different scaling characteristics or complex validation logic.',
    readTime: '4 min read',
    date: '2026-05-26'
  },
  {
    id: 'os-ebpf',
    category: 'OS Internals',
    title: 'eBPF: Sandboxed Programmability in the Kernel',
    shortDescription: 'How Extended Berkeley Packet Filter allows running custom code inside the Linux kernel safely.',
    content: 'Historically, modifying the behavior of the Linux kernel required writing kernel modules or upstreaming code to the kernel itself. Writing kernel modules is notoriously risky—a single memory error or null pointer dereference will crash the entire operating system (Kernel Panic).\n\neBPF (Extended Berkeley Packet Filter) changes this by offering a virtual machine inside the Linux kernel. It allows developers to run sandboxed code at hook points within the kernel space—such as network events, system calls, function entries, and tracepoints—without reloading the kernel or modifying source code.\n\nTo guarantee safety, eBPF programs pass through a strict kernel verifier. The verifier checks that the code cannot crash, contains no infinite loops, registers bounds check all memory accesses, and respects kernel boundaries. Once verified, the bytecode is JIT-compiled into native machine instructions for bare-metal performance. eBPF has revolutionized networking, system observability, and security tooling.',
    takeaway: 'eBPF makes the kernel programmable. It provides a safe, high-performance way to instrument, monitor, and secure applications directly from the OS kernel.',
    readTime: '4 min read',
    date: '2026-05-26'
  },
  {
    id: 'sec-zkp',
    category: 'Security & Crypto',
    title: 'Zero-Knowledge Proofs: Trust Without Sharing',
    shortDescription: 'The core mechanics of cryptographic proofs that verify knowledge without revealing the secret.',
    content: 'Zero-Knowledge Proofs (ZKPs) are cryptographic protocols that enable one party (the Prover) to convince another party (the Verifier) that a specific statement is true, without revealing any information beyond the statement itself. A classic analogy is proving you know the combination to a safe by opening it and retrieving an object, without showing the verifier the actual numbers.\n\nModern ZKPs, such as zk-SNARKs (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge), rely on advanced mathematical concepts like elliptic curve pairings and polynomial commitments. The proof generated is "succinct," meaning it is tiny in size and can be verified in milliseconds, even if the underlying statement computation was massive.\n\nIn practice, ZKPs enable privacy-preserving applications: verifying a user is over 18 without revealing their birthdate, proving ownership of assets without displaying bank balances, and rolling up thousands of blockchain transactions into a single, easily verifiable cryptographic proof to achieve scaling.',
    takeaway: 'ZKPs enable a fundamental shift in security: validating claims mathematically without sharing the sensitive data that supports those claims.',
    readTime: '3 min read',
    date: '2026-05-26'
  },
  {
    id: 'dist-raft',
    category: 'Distributed Databases',
    title: 'Raft Consensus Protocol: Simplicity in Agreement',
    shortDescription: 'An intuitive breakdown of Raft, the modern alternative to Paxos for distributed log replication.',
    content: 'For a distributed database to remain consistent and highly available, nodes must agree on a shared sequence of operations (a log). This agreement is called consensus. For decades, Paxos was the gold standard for consensus, but its implementation details were notoriously difficult to comprehend and code correctly. Raft was designed in 2014 specifically to be understandable.\n\nRaft decomposes consensus into three subproblems: Leader Election, Log Replication, and Safety. A Raft cluster always has one active Leader, while the other nodes are Followers. The leader handles all client write requests, appends them to its log, and replicates them to the followers.\n\nIf the leader fails, followers detect the lack of heartbeats and start a new election, electing a candidate that has the most up-to-date log. Once a write is replicated to a majority of nodes, it is "committed" and safe to apply to the database state machine. Raft guarantees that committed logs are never overwritten, ensuring strict serializability across failures.',
    takeaway: 'Raft achieves consensus by designating a single leader to manage replication, creating a structured, understandable process for building consistent distributed state machines.',
    readTime: '4 min read',
    date: '2026-05-26'
  },

  // -------------------------------------------------------------
  // DATE: 2026-05-25
  // -------------------------------------------------------------
  {
    id: 'comp-jit',
    category: 'Compilers',
    title: 'JIT Compilation: Balancing Speed and Warmup',
    shortDescription: 'How modern runtimes combine interpretation and dynamic compilation for optimal execution.',
    content: 'Programming languages generally fall into two compilation strategies: Ahead-Of-Time (AOT) compiled to machine code (Go, Rust, C++) or Interpreted step-by-step (Python, Ruby). AOT languages start instantly and run at maximum speed, but lack runtime context. Interpreted languages start instantly but run slowly. Just-In-Time (JIT) compilation bridges this gap.\n\nA JIT compiler (used in JavaScript V8, Java JVM, PyPy) starts execution by interpreting the code. While running, it profiles the code to identify "hot spots"—functions or loops executed frequently. It then compiles these hot spots directly into native machine code on the fly.\n\nBecause compilation happens at runtime, the JIT can perform optimizations that AOT compilers cannot. It uses runtime information (such as actual types passed to a generic function) to speculative-inline code and remove dynamic checks. If runtime assumptions change (deoptimization), the VM seamlessly falls back to the interpreter.',
    takeaway: 'JIT compilers combine the quick startup of interpretation with the high execution speeds of native code, optimizing compilation on the fly based on live runtime behavior.',
    readTime: '3 min read',
    date: '2026-05-25'
  },
  {
    id: 'crypto-ecc',
    category: 'Cryptography',
    title: 'Elliptic Curve Cryptography: Power in Curves',
    shortDescription: 'Why smaller ECC keys provide stronger security than traditional RSA cryptosystems.',
    content: 'Public-key cryptography relies on mathematical operations that are easy to perform in one direction but extremely difficult to reverse. RSA relies on the difficulty of factoring the product of two massive prime numbers. However, as computer speeds increase, RSA keys must become impractically large (e.g., 4096 bits) to remain secure, leading to slow handshakes and heavy CPU usage.\n\nElliptic Curve Cryptography (ECC) replaces prime factorization with the algebraic structure of elliptic curves over finite fields. The security of ECC rests on the "elliptic curve discrete logarithm problem"—finding how many times a base point was added to itself to get a resulting public point is computationally impossible.\n\nAn ECC key of just 256 bits offers equivalent security to a 3072-bit RSA key. This reduction in size translates to faster cryptographic signatures, reduced data packet sizes, faster SSL/TLS handshakes, and less power consumption on mobile and IoT devices.',
    takeaway: 'ECC achieves state-of-the-art cryptographic strength using a fraction of the key size required by RSA, improving performance and battery life across the web.',
    readTime: '3 min read',
    date: '2026-05-25'
  },
  {
    id: 'cache-eviction',
    category: 'Caching',
    title: 'Cache Eviction: LRU vs LFU Tradeoffs',
    shortDescription: 'Analyzing recency-based and frequency-based eviction strategies in hardware and software.',
    content: 'Caches are bounded memories. When a cache fills, the system must decide which item to discard to make room for new data. This is the cache eviction problem. The two primary strategies are Least Recently Used (LRU) and Least Frequently Used (LFU).\n\nLRU discards the item that has not been accessed for the longest duration. It assumes that if you accessed data recently, you will likely access it again soon (temporal locality). LRU is simple to implement using a hash map combined with a doubly linked list, achieving O(1) reads, writes, and evictions.\n\nLFU discards the item with the lowest access count. LFU is ideal for items with long-term popularity, but it struggles when access patterns shift—items that were popular in the past retain high frequency counts, blocking newer, more relevant items from caching. LFU also requires tracking hit counts, which increases memory overhead. Modern caches often combine both strategies (e.g., W-TinyLFU in Caffeine cache).',
    takeaway: 'Choose LRU for workloads where temporal recency dominates. Choose LFU when items have a stable, long-term frequency distributions, but be aware of memory overhead and stale entries.',
    readTime: '3 min read',
    date: '2026-05-25'
  },
  {
    id: 'concur-actors-csp',
    category: 'Concurrency',
    title: 'Actors vs CSP: Two Paths to Shared-Nothing Concurrency',
    shortDescription: 'Comparing the mailbox model of Erlang with the channel model of Go.',
    content: 'Writing concurrent applications with shared memory and locks (mutexes) is notorious for producing race conditions, deadlocks, and hard-to-reproduce bugs. To combat this, modern runtimes use a "shared-nothing" approach where concurrent processes communicate by passing messages. The two primary models are the Actor Model and Communicating Sequential Processes (CSP).\n\nIn the Actor Model (used in Erlang/Elixir, Akka), the core primitive is an "Actor". Actors encapsulate state and behavior, and communicate by sending messages directly to each other\'s "mailboxes". The sender must know the identity (address) of the recipient. Actors run asynchronously and operate independently.\n\nIn the CSP Model (used in Go, Clojure), the core primitives are sequential processes and "Channels". Instead of addressing processes directly, processes write to and read from named channels. Channels act as decoupling conduits. They can be unbuffered (blocking synchronization) or buffered (asynchronous). In CSP, the processes are anonymous to each other; they only care about the channel they read from or write to.',
    takeaway: 'Use the Actor Model for fault-tolerant, distributed systems where location transparency is key. Use CSP (channels) for local coordination of lightweight concurrent processes within a single application.',
    readTime: '4 min read',
    date: '2026-05-25'
  }
];
