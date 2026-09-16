import { MasterAnswer } from "./interviewHelpers";

export const GLOBANT_AND_GCP_MASTER_ANSWERS: MasterAnswer[] = [
  {
    "id": "globant_gcve_core",
    "question": "What is Google Cloud VMware Engine (GCVE) and when should it be used?",
    "enText": "Google Cloud VMware Engine provides a fully dedicated, certified VMware stack running natively on Google Cloud bare-metal infrastructure. It is ideal for enterprise lift-and-shift migrations to eliminate on-premise datacenter debt with zero application refactoring while preserving existing vSphere operational tooling.",
    "esText": "GCVE ofrece un stack nativo de VMware sobre bare-metal de Google Cloud, ideal para migrar cargas empresariales sin refactorizar aplicaciones y eliminando costos de datacenter.",
    "category": "Technical",
    "tags": [
      "gcve",
      "vmware",
      "gcp",
      "cloud",
      "migration"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_gcve_networking",
    "question": "How do you interconnect GCVE with native GCP VPCs and on-premise datacenters?",
    "enText": "We peer GCVE with the customer native GCP VPC using Private Services Access over high-speed redundant links, with Cloud Router managing BGP route exchanges. For on-premise connectivity, we terminate dedicated Cloud Interconnect or Cloud VPN to route directly into VMware NSX-T edge routers without hairpinning.",
    "esText": "Conectamos GCVE a la VPC nativa mediante Private Services Access y Cloud Router con BGP, y enlazamos on-premise con Cloud Interconnect directo a NSX-T.",
    "category": "Technical",
    "tags": [
      "gcve",
      "networking",
      "vpc",
      "interconnect",
      "router"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_vmware_migration",
    "question": "How do you execute virtual machine migrations from on-premise to GCVE or Compute Engine?",
    "enText": "We use VMware HCX with vMotion and Replication-Assisted vMotion to perform zero-downtime bulk migrations across stretched Layer 2 networks. For workloads converting directly to native Compute Engine, we leverage Google Cloud Migrate to Virtual Machines with background replication and test clones.",
    "esText": "Usamos VMware HCX con vMotion para migraciones masivas sin downtime sobre redes L2 extendidas, y Migrate to Virtual Machines para conversión directa a Compute Engine.",
    "category": "Technical",
    "tags": [
      "hcx",
      "vmware",
      "migration",
      "vmotion",
      "compute"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_terraform_structure",
    "question": "How do you structure infrastructure as code using Terraform for enterprise GCP environments?",
    "enText": "I follow the Google Cloud Foundation Fabric blueprint, dividing code into modular environments for networking, IAM, compute, and security with remote states in GCS with object versioning. We enforce least privilege through dedicated service accounts and validate pull requests with tfsec and automated CI/CD plans.",
    "esText": "Estructuro Terraform con el blueprint Foundation Fabric, separando módulos de red, IAM y compute con state remoto versionado en GCS y validaciones automáticas.",
    "category": "Technical",
    "tags": [
      "terraform",
      "iac",
      "gcp",
      "modules",
      "ci/cd"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_python_automation",
    "question": "How do you use Python for infrastructure automation in Google Cloud?",
    "enText": "I develop serverless Python automations using the official google-cloud-compute and google-cloud-storage SDKs, triggered by Eventarc or Cloud Scheduler via Cloud Functions. Common use cases include automated snapshot lifecycles, orphaned disk cleanup, and real-time security remediation based on Cloud Audit Logs.",
    "esText": "Desarrollo automatizaciones en Python con los SDKs oficiales en Cloud Functions y Cloud Scheduler, para rotación de snapshots, limpieza de discos y remediación de seguridad.",
    "category": "Technical",
    "tags": [
      "python",
      "automation",
      "sdk",
      "cloud functions",
      "scripts"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_vpc_design",
    "question": "How do you design an enterprise VPC architecture in GCP?",
    "enText": "I implement a Shared VPC topology where host projects centrally manage network firewalls, subnets, and Cloud Routers, while service projects deploy isolated workloads. We place Cloud NAT for outbound internet access and configure Private Google Access so instances reach GCP APIs without public IP addresses.",
    "esText": "Implemento Shared VPC centralizando subredes, firewalls y Cloud Routers en el host project, con Cloud NAT y Private Google Access para evitar IPs públicas.",
    "category": "Technical",
    "tags": [
      "vpc",
      "shared vpc",
      "networking",
      "cloud nat",
      "subnets"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_load_balancing",
    "question": "How does Google Cloud Load Balancing work and how do you handle traffic routing?",
    "enText": "Google Cloud external Application Load Balancers use a single global anycast VIP to route traffic into the nearest Google POP, drastically reducing TLS handshake latency. Backend services utilize instance groups with HTTP health checks, URL routing maps, and Google-managed SSL certificates with automatic zero-downtime renewal.",
    "esText": "Uso Cloud Load Balancing con IP Anycast global para enrutar al POP más cercano, con certificados SSL administrados y health checks hacia instance groups.",
    "category": "Technical",
    "tags": [
      "load balancer",
      "anycast",
      "ssl",
      "routing",
      "pop"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_cloud_armor",
    "question": "How do you protect enterprise GCP infrastructure from DDoS and OWASP Top 10 attacks?",
    "enText": "We deploy Cloud Armor security policies at the external load balancer tier to filter layer-7 attacks and block malicious IP ranges before traffic touches backend compute. In addition, we configure preconfigured WAF rules for SQL injection and cross-site scripting alongside adaptive rate limiting policies.",
    "esText": "Aplico Cloud Armor en el balanceador externo para filtrar ataques L7, rate limiting adaptativo y reglas WAF preconfiguradas contra inyección SQL y XSS.",
    "category": "Technical",
    "tags": [
      "cloud armor",
      "security",
      "waf",
      "ddos",
      "firewall"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_gke_experience",
    "question": "What is your experience with Kubernetes and Google Kubernetes Engine (GKE)?",
    "enText": "I manage both GKE Standard and Autopilot clusters, configuring multi-zone node pools with cluster autoscaler and workload identity federation for secure GCP API access. I write declarative Helm charts and Kustomize overlays integrated with GitOps pipelines for zero-downtime rolling updates.",
    "esText": "Administro clusters de GKE con Workload Identity, cluster autoscaler en multi-zona y despliegues declarativos con Helm y GitOps para rolling updates.",
    "category": "Technical",
    "tags": [
      "gke",
      "kubernetes",
      "helm",
      "k8s",
      "containers"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_linux_troubleshooting",
    "question": "How do you troubleshoot a sudden connection timeout or high latency on a Linux instance in GCP?",
    "enText": "I start by inspecting serial console port logs and local network sockets with ss and netstat, verifying local firewalls with iptables or nftables. If local metrics are clean, I check GCP VPC Flow Logs and Firewall Rules logging in Cloud Logging to confirm whether packets are dropped by network security policies.",
    "esText": "Reviso la consola serie, puertos con ss y reglas de firewall locales; luego audito VPC Flow Logs en Cloud Logging para identificar bloqueos de red en GCP.",
    "category": "Technical",
    "tags": [
      "linux",
      "troubleshooting",
      "ss",
      "sockets",
      "logs",
      "latency"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_ha_dr",
    "question": "How do you architect disaster recovery for critical workloads in GCP?",
    "enText": "We define multi-region active-passive or active-active topologies depending on RPO and RTO requirements, utilizing Cloud Storage cross-region dual-bucket replication and scheduled persistent disk snapshots. For database tiers, we configure Cloud SQL with cross-region read replicas and automated failover.",
    "esText": "Diseño arquitecturas multi-región según RPO/RTO con Cloud Storage dual-region, snapshots programados de discos y réplicas de lectura cross-region en Cloud SQL.",
    "category": "Architecture",
    "tags": [
      "dr",
      "disaster recovery",
      "rpo",
      "rto",
      "multi-region"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_iam_least_privilege",
    "question": "How do you enforce IAM security and manage service accounts in GCP?",
    "enText": "I enforce the principle of least privilege using predefined or custom IAM roles instead of broad primitive Owner or Editor roles. For third-party and CI/CD pipelines, I eliminate long-lived service account keys by implementing Workload Identity Federation with short-lived OAuth tokens.",
    "esText": "Aplico mínimo privilegio con roles personalizados, eliminando claves JSON fijas mediante Workload Identity Federation con tokens temporales de corta vida.",
    "category": "Security",
    "tags": [
      "iam",
      "least privilege",
      "service accounts",
      "security",
      "oauth"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_finops_costs",
    "question": "How do you optimize infrastructure costs in GCP without compromising performance?",
    "enText": "I analyze GCP Billing reports and Recommender insights to implement Committed Use Discounts for baseline compute alongside custom VM sizing to eliminate overprovisioning. We also apply Cloud Storage lifecycle rules to transition cold backups to Nearline or Archive storage tiers automatically.",
    "esText": "Optimizo costos con Committed Use Discounts, ajuste de CPU/RAM con Recommender y políticas de ciclo de vida en Cloud Storage hacia Nearline y Archive.",
    "category": "Technical",
    "tags": [
      "finops",
      "costs",
      "cud",
      "billing",
      "storage tiers"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_monitoring_observability",
    "question": "How do you set up monitoring and alerting for enterprise cloud infrastructure in GCP?",
    "enText": "I implement Cloud Monitoring dashboards tracking golden signals—latency, traffic, errors, and saturation—using Ops Agent metrics from compute instances. Alerting policies are integrated with PagerDuty or Slack with defined dynamic thresholds to notify on anomalous CPU spikes, disk exhaustion, or 5xx error spikes.",
    "esText": "Configuro Cloud Monitoring con Ops Agent para rastrear latencia, saturación y errores, integrando alertas automatizadas a Slack y PagerDuty ante anomalías.",
    "category": "Technical",
    "tags": [
      "monitoring",
      "observability",
      "alerts",
      "ops agent",
      "pagerduty"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_agile_pods",
    "question": "How do you collaborate in agile teams and Globants Agile Pods model?",
    "enText": "I thrive in cross-functional Agile Pods where engineers take full end-to-end ownership of infrastructure deliverables through two-week sprints and continuous feedback loops. I prioritize transparent communication with client stakeholders, blameless retrospectives, and clear technical documentation to maintain high delivery velocity.",
    "esText": "Trabajo en Agile Pods con ownership de punta a punta, sprints de dos semanas, retrospectivas sin culpa y comunicación transparente con los clientes de Globant.",
    "category": "Behavioral",
    "tags": [
      "agile pods",
      "globant",
      "sprints",
      "collaboration",
      "agile"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_why_join",
    "question": "Why are you interested in joining Globant and working on this Intermedia project?",
    "enText": "Globant is a recognized global digital leader, and this project represents the ideal synergy between my deep hands-on expertise in GCP and enterprise-scale infrastructure transformation. I am motivated to solve complex hybrid virtualization challenges with GCVE while automating cloud operations with Terraform and Python.",
    "esText": "Globant es referente global y este proyecto combina mi experiencia práctica en GCP con desafíos enterprise de GCVE, automatización con Terraform y Python.",
    "category": "Screening",
    "tags": [
      "why globant",
      "intermedia",
      "motivation",
      "fit"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_salary_rate",
    "question": "What are your salary expectations for this hourly contractor role?",
    "enText": "For this full-time contractor engagement, my target hourly rate is between twenty-five and thirty dollars per hour, which aligns with my four thousand dollar monthly benchmark. I am fully accustomed to the international contractor model and ready to start immediately.",
    "esText": "Para este esquema contractor full-time mi tarifa de referencia se sitúa entre 25 y 30 USD por hora, equivalente a unos 4,000 USD mensuales brutos.",
    "category": "Screening",
    "tags": [
      "salary",
      "rate",
      "hourly",
      "contractor",
      "usd"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_experience_strict",
    "question": "How many years of experience do you have in cloud and software engineering?",
    "enText": "I bring over eight years of comprehensive background in software engineering, backend systems, and IT infrastructure. For the last four years, I have been dedicated exclusively to enterprise Google Cloud Platform, Terraform, Linux environments, and DevOps automation.",
    "esText": "Sumo más de 8 años de trayectoria en sistemas, desarrollo y software, con los últimos ~4 años dedicados exclusivamente a GCP, Terraform y DevOps.",
    "category": "Screening",
    "tags": [
      "experience",
      "years",
      "background",
      "seniority"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_smalltalk_pets",
    "question": "Do you have any pets or animals at home?",
    "enText": "Yes, I do! I have a rescued dog named Luna who was adopted from the street and is my daily remote work companion here in Salta. We go on walks to disconnect from the screen, and she brings great positive energy to my daily routine.",
    "esText": "¡Sí, totalmente! Tengo una perrita adoptada que se llama Luna en Salta; salimos a caminar para despejar la vista del monitor y resetear el foco mental.",
    "category": "Screening",
    "tags": [
      "pets",
      "dog",
      "luna",
      "salta",
      "small talk"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_smalltalk_hobbies",
    "question": "What do you do in your free time or on weekends?",
    "enText": "In my free time, I love cycling outdoors around the scenic hills of Salta and spending time with my family and dog Luna. I also enjoy tinkering with my home-lab infrastructure to experiment with new cloud tools.",
    "esText": "Me encanta salir a pedalear al aire libre por Salta, compartir tiempo con mi perrita Luna y experimentar en mi home-lab con herramientas cloud.",
    "category": "Screening",
    "tags": [
      "hobbies",
      "free time",
      "cycling",
      "weekends",
      "salta"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_incident_resolution",
    "question": "Tell me about a time you resolved a critical production incident or technical disagreement.",
    "enText": "During a major cloud migration, we detected intermittent packet drops across our hybrid interconnect tunnel that threatened client deadlines. I coordinated a live tcpdump trace and MTU audit, identified mismatched jumbo frame configurations on the edge router, and applied an automated fix within two hours.",
    "esText": "Durante una migración detectamos caídas intermitentes en el túnel híbrido; coordiné una traza de tcpdump, corregí el MTU en el router y normalicé el tráfico en 2 horas.",
    "category": "Behavioral",
    "tags": [
      "incident",
      "star",
      "troubleshooting",
      "conflict",
      "mtu"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_databases_gcp",
    "question": "What database and compute options do you recommend for enterprise workloads in GCP?",
    "enText": "For relational transactional workloads requiring high availability, I configure Cloud SQL with automated cross-zone failover and point-in-time recovery. For high-throughput analytics or massive cache layers, we combine BigQuery with Memorystore for Redis to minimize database read pressure.",
    "esText": "Para transacciones recomiendo Cloud SQL con failover cross-zone y backups continuos, complementado con Memorystore para Redis para cachear lecturas de alta concurrencia.",
    "category": "Architecture",
    "tags": [
      "cloud sql",
      "database",
      "redis",
      "memorystore",
      "bigquery"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_linux_tools",
    "question": "Which Linux commands and diagnostic tools do you rely on during troubleshooting?",
    "enText": "I use ss to inspect open sockets and connection states, lsof to identify file handle and port locks, and journalctl alongside dmesg to catch kernel panic or OOM killer events. For performance bottlenecks, I combine vmstat, iostat, and htop to pinpoint CPU steal time or disk I/O wait.",
    "esText": "Uso ss para sockets, lsof para descriptores de archivo, journalctl y dmesg para eventos de kernel y OOM, y vmstat o iostat para identificar saturación de I/O.",
    "category": "Technical",
    "tags": [
      "linux tools",
      "ss",
      "lsof",
      "journalctl",
      "htop",
      "diagnostics"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_cicd_pipelines",
    "question": "How do you implement CI/CD deployment pipelines for cloud infrastructure?",
    "enText": "I build automated pipelines using GitHub Actions or Cloud Build that run terraform fmt, tfsec linting, and automated plan generation on every pull request. Merges to main trigger state locks and phased canary applies, ensuring all infrastructure changes are peer-reviewed and fully auditable.",
    "esText": "Construyo pipelines en GitHub Actions y Cloud Build con validación de tfsec, planes automáticos en PRs y despliegues auditados tras merge a la rama principal.",
    "category": "Technical",
    "tags": [
      "ci/cd",
      "github actions",
      "cloud build",
      "terraform",
      "automation"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_reverse_questions",
    "question": "Do you have any questions for us about Globant or the project?",
    "enText": "Yes! Could you tell me more about the current stage of this GCP infrastructure project—is the primary focus on initial GCVE workload migration or long-term Terraform automation? Also, how is the engineering team structured between Globant and Intermedia?",
    "esText": "¿Podrías contarme en qué fase está el proyecto: si el foco prioritario es la migración inicial con GCVE o la automatización con Terraform? ¿Y cómo interactúa el equipo con Intermedia?",
    "category": "Screening",
    "tags": [
      "questions for them",
      "reverse questions",
      "cierre",
      "team"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "base_1",
    "question": "Do you have animals or pets in your home?",
    "enText": "Yes, I do! I have a rescued dog named Luna. She was adopted from the street and is my daily remote work companion here in Salta. We go on walks, she brings great positive energy, and she reminds me to take short breaks away from the screen during the day.",
    "esText": "¡Sí, totalmente! Tengo una perrita adoptada que se llama Luna. Es mi fiel compañera trabajando remoto acá en Salta: salimos a caminar, aporta una energía bárbara y me ayuda a despejar la vista del monitor y resetear el foco mental.\n\n---",
    "category": "Screening",
    "tags": [
      "have",
      "animals",
      "pets",
      "your",
      "home"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571604087
  },
  {
    "id": "base_2",
    "question": "¿Tenés mascotas o animales en tu casa?",
    "enText": "Yes, I do! I have a rescued dog named Luna. She was adopted from the street and is my daily remote work companion here in Salta. We go on walks, she brings great positive energy, and she reminds me to take short breaks away from the screen during the day.",
    "esText": "¡Sí, totalmente! Tengo una perrita adoptada que se llama Luna. Es mi fiel compañera trabajando remoto acá en Salta: salimos a caminar, aporta una energía bárbara y me ayuda a despejar la vista del monitor y resetear el foco mental.",
    "category": "Screening",
    "tags": [
      "tens",
      "mascotas",
      "animales",
      "casa"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571605087
  },
  {
    "id": "base_3",
    "question": "What did you do the last weekend or what are your weekend plans?",
    "enText": "Last weekend was pretty relaxing. I spent some time outdoors, went for a bike ride to disconnect, and spent time with family. On Sunday, I worked a bit on my home-lab setup and rested to start the week fresh.",
    "esText": "El finde estuvo muy tranquilo: salí a hacer algo de bici al aire libre para desconectar, estuve con la familia y el domingo le dediqué un rato a mi home-lab antes de arrancar la semana con energía.\n\n---",
    "category": "Screening",
    "tags": [
      "what",
      "last",
      "weekend",
      "what",
      "your",
      "weekend"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571606087
  },
  {
    "id": "base_4",
    "question": "¿Qué hiciste el fin de semana pasado o qué planes tenés para el finde?",
    "enText": "Last weekend was pretty relaxing. I spent some time outdoors, went for a bike ride to disconnect, and spent time with family. On Sunday, I worked a bit on my home-lab setup and rested to start the week fresh.",
    "esText": "El finde estuvo muy tranquilo: salí a hacer algo de bici al aire libre para desconectar, estuve con la familia y el domingo le dediqué un rato a mi home-lab antes de arrancar la semana con energía.",
    "category": "Screening",
    "tags": [
      "hiciste",
      "semana",
      "pasado",
      "planes",
      "tens",
      "para"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571607087
  },
  {
    "id": "base_5",
    "question": "Tell me about yourself, your background, and your personal life.",
    "enText": "Personally, I’m based in Salta, Argentina, living with my adopted rescue dog Luna, and I love cycling outdoors. Professionally, I bring over eight years of total IT and software engineering experience, with the last four years focused on Cloud Architecture, DevOps, and backend systems.",
    "esText": "En lo personal vivo en Salta, tengo a mi perrita adoptada Luna y me encanta salir a pedalear. En lo profesional sumo más de 8 años en software y backend, con los últimos 4 años dedicados a arquitectura cloud, DevOps y sistemas escalables.\n\n---",
    "category": "Screening",
    "tags": [
      "tell",
      "about",
      "yourself",
      "your",
      "background",
      "your"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571608087
  },
  {
    "id": "base_6",
    "question": "Contame de vos, tu historia personal y tu recorrido laboral.",
    "enText": "Personally, I’m based in Salta, Argentina, living with my adopted rescue dog Luna, and I love cycling outdoors. Professionally, I bring over eight years of total IT and software engineering experience, with the last four years focused on Cloud Architecture, DevOps, and backend systems.",
    "esText": "En lo personal vivo en Salta, tengo a mi perrita adoptada Luna y me encanta salir a pedalear. En lo profesional sumo más de 8 años en software y backend, con los últimos 4 años dedicados a arquitectura cloud, DevOps y sistemas escalables.",
    "category": "Screening",
    "tags": [
      "contame",
      "historia",
      "personal",
      "recorrido",
      "laboral"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571609087
  },
  {
    "id": "base_7",
    "question": "Where do you live and how is the weather or your city?",
    "enText": "I live in Salta, in the northwest region of Argentina. The weather here is mostly sunny and very pleasant throughout the year. It’s surrounded by mountains and peaceful landscapes, which makes it an ideal place to focus and work remotely.",
    "esText": "Vivo en Salta, al noroeste de Argentina. El clima es templado y soleado casi todo el año. Está rodeada de cerros y paisajes tranquilos, ideal para concentrarse y trabajar 100% en remoto.\n\n---",
    "category": "Screening",
    "tags": [
      "where",
      "live",
      "weather",
      "your",
      "city"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571610087
  },
  {
    "id": "base_8",
    "question": "¿Dónde vivís y cómo es tu ciudad o el clima por allá?",
    "enText": "I live in Salta, in the northwest region of Argentina. The weather here is mostly sunny and pleasant, surrounded by mountains and peaceful nature.",
    "esText": "Vivo en Salta, al noroeste de Argentina. El clima es templado y soleado casi todo el año. Está rodeada de cerros y paisajes tranquilos, ideal para concentrarse y trabajar 100% en remoto.",
    "category": "Screening",
    "tags": [
      "dnde",
      "vivs",
      "ciudad",
      "clima"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571611087
  },
  {
    "id": "base_9",
    "question": "What is your morning routine or how do you start your day?",
    "enText": "I like to start early with a cup of coffee and review my daily priorities before opening communication channels. I take a quick walk or stretch to get moving, and then I jump into my morning standup or code reviews with a clear mind.",
    "esText": "Me gusta arrancar temprano con un café y revisar las prioridades del día antes de abrir canales de chat. Hago un estiramiento o caminata corta y después me meto de lleno en las standups y revisiones con la cabeza despejada.\n\n---",
    "category": "Screening",
    "tags": [
      "what",
      "your",
      "morning",
      "routine",
      "start",
      "your"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571612087
  },
  {
    "id": "base_10",
    "question": "¿Cómo es tu rutina matutina o cómo arrancás tu día?",
    "enText": "I start early with coffee, plan my top tasks before checking messages, get some light movement, and then begin the workday focused.",
    "esText": "Me gusta arrancar temprano con un café y revisar las prioridades del día antes de abrir canales de chat. Hago un estiramiento o caminata corta y después me meto de lleno en las standups y revisiones con la cabeza despejada.",
    "category": "Screening",
    "tags": [
      "rutina",
      "matutina",
      "arrancs"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571613087
  },
  {
    "id": "base_11",
    "question": "What kind of music, books, or podcasts do you enjoy?",
    "enText": "For music, I listen to instrumental lo-fi or electronic music while deep in coding or infrastructure design. I also read tech blogs and architecture case studies, and occasionally listen to engineering podcasts like Software Engineering Radio.",
    "esText": "Para trabajar suelo escuchar lo-fi instrumental o electrónica tranquila para concentrarme. También leo blogs de arquitectura técnica y escucho podcasts sobre ingeniería de software y sistemas distribuidos.\n\n---",
    "category": "Screening",
    "tags": [
      "what",
      "kind",
      "music",
      "books",
      "podcasts",
      "enjoy"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571614087
  },
  {
    "id": "base_12",
    "question": "What do you like to do in your free time or what are your hobbies?",
    "enText": "In my free time, I really enjoy cycling, outdoor sports, and spending time in nature. I also like listening to music, reading up on new cloud and AI architectures, and experimenting with personal tech projects in my home-lab.",
    "esText": "En mi tiempo libre me gusta salir a pedalear, hacer deporte al aire libre y disfrutar de la naturaleza. También disfruto escuchar música y probar tecnologías nuevas o arquitecturas cloud en mi home-lab.\n\n---",
    "category": "Screening",
    "tags": [
      "what",
      "like",
      "your",
      "free",
      "time",
      "what"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571615087
  },
  {
    "id": "base_13",
    "question": "Do you like to cook or what is your favorite food?",
    "enText": "Yes, I enjoy cooking simple and hearty meals. Living in northern Argentina, I really enjoy traditional dishes like empanadas and asado on the weekends with family, but during the week I keep my diet balanced and practical.",
    "esText": "Sí, me gusta cocinar comida casera. Viviendo en Salta disfruto mucho las comidas típicas como empanadas y asado los fines de semana, pero durante la semana me mantengo práctico y saludable.\n\n---",
    "category": "Screening",
    "tags": [
      "like",
      "cook",
      "what",
      "your",
      "favorite",
      "food"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571616087
  },
  {
    "id": "base_14",
    "question": "How would you describe your personality in three words?",
    "enText": "I would say: dependable, analytical, and adaptable. Dependable because I take full ownership of my commitments; analytical because I love digging into root causes; and adaptable because I thrive in fast-evolving tech environments.",
    "esText": "Diría: confiable, analítico y adaptable. Confiable porque me hago dueño de lo que me comprometo; analítico porque busco la causa raíz de las cosas; y adaptable porque me muevo muy bien en entornos técnicos cambiantes.\n\n---\n\n## CAPÍTULO 2: PRESENTACIONES Y ELEVATOR PITCH POR CADA PERFIL",
    "category": "Screening",
    "tags": [
      "would",
      "describe",
      "your",
      "personality",
      "three",
      "words"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571617087
  },
  {
    "id": "base_15",
    "question": "Can you introduce yourself or tell me about your background? [Rol: Cloud & DevOps Architect]",
    "enText": "I'm a Senior Cloud Architect & DevOps Engineer with 8+ years in IT and 4+ years dedicated to Google Cloud Platform, Kubernetes (GKE), and Infrastructure as Code with Terraform. At Reforest Latam, I led the platform team and reduced monthly GCP spend by 28% through FinOps. I also design reusable Terraform modules and GitOps pipelines with ArgoCD.",
    "esText": "Soy Cloud Architect & DevOps con más de 8 años en tecnología y más de 4 años especializado de lleno en GCP, Kubernetes (GKE) e Infraestructura como Código con Terraform. En Reforest Latam lideré plataforma logrando un 28% de ahorro en GCP con FinOps y pipelines GitOps con ArgoCD.\n\n---",
    "category": "Screening",
    "tags": [
      "introduce",
      "yourself",
      "tell",
      "about",
      "your",
      "background"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571618087
  },
  {
    "id": "base_16",
    "question": "Can you introduce yourself or tell me about your background? [Rol: DBA & Data Engineer]",
    "enText": "I'm a Senior DBA & Data Engineer with 8+ years administering relational engines (PostgreSQL, SQL Server) and BigQuery data pipelines. At UBA, I managed 8+ TB of mission-critical data with high-availability replication (RPO < 15 min, RTO < 1 hour), and built automated ELT pipelines with Apache Airflow and Polars cutting batch runtimes by 60%.",
    "esText": "Soy DBA Senior y Data Engineer con 8+ años gestionando PostgreSQL, SQL Server y BigQuery. En la UBA administré más de 8TB de datos con réplica de alta disponibilidad (RPO < 15m, RTO < 1h) y construí pipelines ELT con Airflow y Polars reduciendo 60% las ventanas de procesamiento.\n\n---",
    "category": "Screening",
    "tags": [
      "introduce",
      "yourself",
      "tell",
      "about",
      "your",
      "background"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571619087
  },
  {
    "id": "base_17",
    "question": "Can you introduce yourself or tell me about your background? [Rol: Full Stack Developer]",
    "enText": "I'm a Senior Full Stack Developer with 8+ years building reactive, high-performance web applications. On the frontend, I specialize in React 18, Next.js 14 App Router, and TypeScript, optimizing Core Web Vitals (LCP < 1.2s). On the backend, I build asynchronous microservices with Python (FastAPI) and Node.js, backed by PostgreSQL with pgvector and Redis caching.",
    "esText": "Soy Full Stack Developer Senior con 8+ años creando aplicaciones web reactivas. En frontend domino React 18, Next.js 14 y TypeScript, optimizando Core Web Vitals (LCP < 1.2s). En backend desarrollo microservicios con FastAPI y Node.js sobre PostgreSQL (con pgvector) y Redis.\n\n---",
    "category": "Screening",
    "tags": [
      "introduce",
      "yourself",
      "tell",
      "about",
      "your",
      "background"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571620087
  },
  {
    "id": "base_18",
    "question": "Can you introduce yourself or tell me about your background? [Rol: Python Backend Engineer & Tech Lead]",
    "enText": "I'm a Senior Python Backend Engineer and Tech Lead with 8+ years architecting scalable microservices. I specialize in Python 3.10+, FastAPI, Asyncio, Celery, and SQLAlchemy 2.0. At Reforest Latam, I led a platform team of 6 engineers, adopting Clean Architecture, Domain-Driven Design, and achieving over 85% test coverage with Pytest.",
    "esText": "Soy Backend Engineer y Tech Lead especializado en Python (FastAPI, Asyncio, Celery, SQLAlchemy 2.0). Lideré equipos de 6 ingenieros en Reforest Latam bajo Clean Architecture y DDD, con más de 85% de cobertura de tests en Pytest y APIs asíncronas de alta concurrencia.\n\n---",
    "category": "Screening",
    "tags": [
      "introduce",
      "yourself",
      "tell",
      "about",
      "your",
      "background"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571621087
  },
  {
    "id": "base_19",
    "question": "Can you introduce yourself or tell me about your background? [Rol: SAP Cloud Infrastructure & Basis Engineer]",
    "enText": "I'm a Senior Cloud Infrastructure & SAP Basis Engineer with 8+ years sizing, migrating, and optimizing SAP workloads on GCP. I specialize in SUSE Linux (SLES 15 SP7), Pacemaker/Corosync High Availability clustering, block-aligned XFS/LVM storage layouts, and automated provisioning using Terraform and Ansible for SAP CAR Rise and SAP HANA 2.0.",
    "esText": "Soy Ingeniero de Infraestructura Cloud y SAP Basis con 8+ años desplegando y migrando SAP sobre GCP en SUSE Linux (SLES 15 SP7). Manejo clusters de alta disponibilidad con Pacemaker/Corosync, storage afinado con XFS/LVM para alto I/O y aprovisionamiento con Terraform para SAP CAR Rise y HANA.\n\n---",
    "category": "Screening",
    "tags": [
      "introduce",
      "yourself",
      "tell",
      "about",
      "your",
      "background"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571622087
  },
  {
    "id": "base_20",
    "question": "Can you introduce yourself or tell me about your background? [Rol: Senior Software Engineer & Cloud Solutions Architect]",
    "enText": "I have a T-shaped profile with 8+ years designing and scaling mission-critical distributed systems. I bridge deep software engineering in Python and TypeScript with cloud architecture on Google Cloud (GKE, Cloud Run, Terraform), real-time observability with OpenTelemetry and Instana, and strategic technical leadership.",
    "esText": "Tengo un perfil T-Shaped con 8+ años diseñando sistemas distribuidos tolerantes a fallos. Combino desarrollo de software backend en Python/TypeScript con arquitectura cloud en GCP (GKE, Cloud Run, Terraform), observabilidad distribuida con OpenTelemetry y liderazgo técnico.\n\n---\n\n## CAPÍTULO 3: PREGUNTAS TRAMPA Y SITUACIONALES DE RECURSOS HUMANOS",
    "category": "Screening",
    "tags": [
      "introduce",
      "yourself",
      "tell",
      "about",
      "your",
      "background"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571623087
  },
  {
    "id": "base_21",
    "question": "How did you manage working at UBA for 6 years while also doing B2B consulting?",
    "enText": "My role at UBA was part-time, specifically focused on mission-critical database administration, replication, and performance tuning during scheduled institutional windows. This gave me full schedule predictability to dedicate full-time focus to high-impact B2B consulting, cloud migrations, and platform engineering for private clients.",
    "esText": "Mi rol en la UBA fue part-time, enfocado en administración de bases de datos críticas, réplica y tuning en ventanas programadas. Esto me dio total previsibilidad horaria para dedicarme a la consultoría enterprise B2B, migraciones cloud e ingeniería de plataforma con clientes corporativos.\n\n---",
    "category": "Technical",
    "tags": [
      "manage",
      "working",
      "years",
      "while",
      "also",
      "doing"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571624087
  },
  {
    "id": "base_22",
    "question": "Tell me about a time you had to say NO to a client, manager, or product team.",
    "enText": "At Reforest Latam, the product team wanted to deploy a massive unindexed feature straight to production to meet a sales demo deadline. I explained the risk of database lockouts and presented an alternative: a feature flag enabling the demo for the single prospective client on staging, while scheduling the proper database migration and indexing for the next sprint release.",
    "esText": "El equipo de producto quería subir una funcionalidad pesada sin indexar directo a producción para una demo comercial. Expliqué el riesgo de bloqueo de base de datos y propuse habilitarlo con un feature flag en staging exclusivamente para la demo, mientras preparábamos los índices y la migración definitiva para el siguiente sprint.\n\n---",
    "category": "Technical",
    "tags": [
      "tell",
      "about",
      "time",
      "client",
      "manager",
      "product"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571625087
  },
  {
    "id": "base_23",
    "question": "What do you do if you realize you are going to miss an upcoming deadline?",
    "enText": "I communicate early—the moment I detect a variance, not on the due date. I present three clear options to the team: reducing secondary scope to deliver the core MVP on time, reallocating resources, or adjusting the target date with an updated risk assessment. Transparent communication prevents surprises.",
    "esText": "Aviso con anticipación apenas detecto el desvío, nunca el día de la entrega. Presento tres opciones: recortar alcance secundario para entregar el MVP a tiempo, reasignar tareas o ajustar la fecha con un análisis de impacto claro. La transparencia total evita sorpresas.\n\n---",
    "category": "Technical",
    "tags": [
      "what",
      "realize",
      "going",
      "miss",
      "upcoming",
      "deadline"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571626087
  },
  {
    "id": "base_24",
    "question": "How do you approach working with legacy code that has zero tests and no documentation?",
    "enText": "I never do a blind rewrite. First, I establish characterization tests (end-to-end black-box tests) to freeze current behavior and capture edge cases. Second, I introduce automated linting and static analysis. Finally, I refactor incrementally using the Strangler Fig pattern, wrapping legacy functions with unit tests as I touch each module.",
    "esText": "Nunca reescribo a ciegas. Primero creo characterization tests (tests de caja negra) para congelar el comportamiento actual; segundo aplico linters y análisis estático; y tercero refactorizo incrementalmente agregando tests unitarios a cada función que toco.\n\n---",
    "category": "Technical",
    "tags": [
      "approach",
      "working",
      "with",
      "legacy",
      "code",
      "that"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571627087
  },
  {
    "id": "base_25",
    "question": "What has been your biggest production failure and how did you handle the postmortem?",
    "enText": "During a database upgrade, an unmonitored lock cascade brought query latencies up to 10 seconds. I immediately initiated a rollback to restore the SLA within 12 minutes. Afterward, I led a blameless postmortem: we analyzed the lock graph, introduced automated staging stress-tests in CI/CD, and created an updated runbook so the issue could never recur.",
    "esText": "Durante un upgrade de base de datos, una cascada de bloqueos elevó la latencia a 10s. Inicié el rollback de inmediato restaurando el servicio en 12 minutos. Luego lideré un postmortem sin culpas: analizamos el grafo de locks, sumamos stress-tests automáticos en staging y creamos un runbook para evitar que vuelva a suceder.\n\n---",
    "category": "Technical",
    "tags": [
      "what",
      "been",
      "your",
      "biggest",
      "production",
      "failure"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571628088
  },
  {
    "id": "base_26",
    "question": "What is an area you are actively working to improve or a weakness?",
    "enText": "Sometimes I dive so deep into perfecting an architectural solution that I have to remind myself that 'good and shipped' is often better than 'perfect.' To balance this, I set clear timeboxes and align early with the team on the minimum viable architecture.",
    "esText": "A veces me entusiasmo buscando la perfección técnica absoluta y tengo que recordarme que algo funcional y entregado a tiempo es mejor que perfecto. Para gestionarlo, me pongo timeboxes estrictos y valido pronto con el equipo la arquitectura mínima viable.\n\n---",
    "category": "Technical",
    "tags": [
      "what",
      "area",
      "actively",
      "working",
      "improve",
      "weakness"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571629088
  },
  {
    "id": "base_27",
    "question": "What are your greatest strengths as an engineer?",
    "enText": "My top strengths are ownership, deep problem-solving, and calm execution. I don't just provision infrastructure or write code; I look at resilience, security, cost optimization, and developer experience end-to-end. I stay very level-headed during high-severity production incidents.",
    "esText": "Mis mayores fortalezas son el sentido de ownership, la capacidad analítica para resolver problemas complejos y la calma bajo presión. No me limito a levantar infra o escribir código, miro la resiliencia, seguridad, costos y experiencia del equipo de punta a punta.\n\n---",
    "category": "Technical",
    "tags": [
      "what",
      "your",
      "greatest",
      "strengths",
      "engineer"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571630088
  },
  {
    "id": "base_28",
    "question": "How do you handle technical disagreements with a team member or stakeholder?",
    "enText": "I decouple the technical decision from personal opinions. First, I listen actively to understand their constraints and trade-offs. Second, I bring objective data: benchmarks, proof of concepts, or cost implications. Finally, we document the decision in an Architecture Decision Record (ADR) so everyone commits to the outcome.",
    "esText": "Separo la discusión técnica de lo personal. Escucho los argumentos del otro, evaluamos datos objetivos (benchmarks, costos o PoCs) y documentamos la decisión en un Architecture Decision Record (ADR) para que todo el equipo avance alineado.\n\n---",
    "category": "Technical",
    "tags": [
      "handle",
      "technical",
      "disagreements",
      "with",
      "team",
      "member"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571631088
  },
  {
    "id": "base_29",
    "question": "Why should we hire you over other candidates?",
    "enText": "Because of my T-shaped capability: I combine deep hands-on expertise in Cloud, Backend, and Data with real business impact—like reducing cloud spend by 28% and provisioning times by 70%. I don't just write code; I take full ownership of production stability, security, and team collaboration.",
    "esText": "Por mi perfil T-Shaped: combino profundidad técnica en Cloud, Backend y Datos con impacto medible en el negocio (28% de ahorro en nube, 70% menos tiempo de provisión). No solo programo o levanto infra, me hago dueño de la estabilidad, seguridad y el éxito del equipo.\n\n---",
    "category": "Technical",
    "tags": [
      "should",
      "hire",
      "over",
      "other",
      "candidates"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571632088
  },
  {
    "id": "base_30",
    "question": "Where do you see yourself in 3 to 5 years?",
    "enText": "I see myself growing further as a Principal Architect or Staff Engineer, leading technical strategy for high-scale distributed systems, mentoring upcoming engineering talent, and driving innovations in cloud resilience, automation, and AI integrations.",
    "esText": "Me veo consolidado como Principal Architect o Staff Engineer, liderando la estrategia de sistemas distribuidos de gran escala, guiando técnicamente al equipo e impulsando innovaciones en resiliencia cloud, automatización e IA.\n\n---\n\n## CAPÍTULO 4: CULTURA, LIDERAZGO Y METODOLOGÍA STAR",
    "category": "Technical",
    "tags": [
      "where",
      "yourself",
      "years"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571633088
  },
  {
    "id": "base_31",
    "question": "How do you mentor junior engineers and maintain high code quality?",
    "enText": "I focus on empowering rather than gatekeeping. In code reviews, I ask open questions about edge cases and failure modes instead of nitpicking syntax. I establish clear ADRs, pair program on complex architectural problems, and ensure automated linters and test suites handle styling so reviews focus on architecture and business logic.",
    "esText": "En las revisiones de código no me enfoco en detalles cosméticos sino en failure modes, escalabilidad y legibilidad. Fomento pair programming en tareas complejas, defino ADRs claros y dejo que los linters automáticos cuiden el estilo para concentrarnos en la arquitectura.\n\n---",
    "category": "Technical",
    "tags": [
      "mentor",
      "junior",
      "engineers",
      "maintain",
      "high",
      "code"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571634088
  },
  {
    "id": "base_32",
    "question": "How do you prioritize tasks when everything seems urgent?",
    "enText": "I evaluate tasks based on two factors: business impact and blast radius. I protect production reliability first, unblock teammates second, and negotiate realistic timelines with product managers by communicating technical trade-offs openly instead of over-promising.",
    "esText": "Priorizo evaluando impacto en el negocio y criticidad del sistema. Primero aseguro la estabilidad de producción, segundo destrabo al equipo y negocio plazos realistas con los líderes explicando trade-offs en lugar de prometer cosas imposibles.\n\n---",
    "category": "Technical",
    "tags": [
      "prioritize",
      "tasks",
      "when",
      "everything",
      "seems",
      "urgent"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571635088
  },
  {
    "id": "base_33",
    "question": "Tell me about a time you persuaded your team or leadership to adopt a new tool or technology.",
    "enText": "At Reforest Latam, manual deployment verification took hours. I proposed adopting ArgoCD for GitOps. Instead of forcing a full migration, I built a quick prototype on one microservice showing automated rollbacks and zero-downtime releases. The team saw the proof, and we collectively rolled it out, cutting lead times from days to minutes.",
    "esText": "Los despliegues manuales tardaban horas. Propuse adoptar ArgoCD para GitOps armando primero un prototipo en un microservicio de bajo riesgo mostrando rollbacks automáticos. Al ver la evidencia en vivo, el equipo adoptó la herramienta reduciendo tiempos de despliegue de días a minutos.\n\n---",
    "category": "Technical",
    "tags": [
      "tell",
      "about",
      "time",
      "persuaded",
      "your",
      "team"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571636088
  },
  {
    "id": "base_34",
    "question": "How do you handle high-pressure deadlines and prevent burnout?",
    "enText": "I maintain sustainable engineering practices: I automate repetitive tasks, avoid heroics, and ensure technical debt is tracked visibly in sprint backlogs. Outside work, keeping clear boundaries with sports, cycling, and family helps me stay refreshed and sharp.",
    "esText": "Aplico prácticas sustentables: automatizo tareas repetitivas, evito soluciones mágicas a última hora y visibilizo la deuda técnica. Fuera del trabajo mantengo límites claros con el deporte y la familia para rendir siempre al 100%.\n\n---",
    "category": "Technical",
    "tags": [
      "handle",
      "highpressure",
      "deadlines",
      "prevent",
      "burnout"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571637088
  },
  {
    "id": "base_35",
    "question": "Tell me about a time you had to deliver under incomplete requirements or ambiguity.",
    "enText": "In consulting projects, client requirements are often vague. I handle this by defining assumptions explicitly, building a minimum viable proof of concept (PoC), and establishing rapid feedback loops. Documenting assumptions prevents misaligned expectations and keeps development moving forward.",
    "esText": "En consultoría es común la ambigüedad. Lo resuelvo explicitando suposiciones por escrito, armando una PoC mínima y coordinando validaciones cortas. Documentar supuestos evita desalineaciones y permite avanzar sin frenar el proyecto.\n\n---",
    "category": "Technical",
    "tags": [
      "tell",
      "about",
      "time",
      "deliver",
      "under",
      "incomplete"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571638088
  },
  {
    "id": "base_36",
    "question": "Why are you looking for a change or open to new job opportunities?",
    "enText": "I'm looking for my next professional step where I can tackle complex, large-scale enterprise challenges. I want to contribute my 8+ years of cloud infrastructure, automation, and DevOps experience to a team that values technical excellence and continuous improvement.",
    "esText": "Estoy buscando dar mi siguiente paso profesional en proyectos enterprise de gran escala, donde pueda volcar mis más de 8 años en arquitectura cloud y automatización en un equipo con alta cultura técnica y foco en calidad.\n\n---",
    "category": "Technical",
    "tags": [
      "looking",
      "change",
      "open",
      "opportunities"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571639088
  },
  {
    "id": "base_37",
    "question": "Are you currently interviewing with other companies?",
    "enText": "Yes, I am currently exploring a few select senior opportunities that align closely with my background in Cloud Architecture, DevOps, and Backend systems. However, I prioritize finding the right cultural fit and technical challenge over rushing into an offer.",
    "esText": "Sí, estoy conversando en algunos procesos puntuales acordes a mi seniority en Cloud, DevOps y Backend. Sin embargo, mi prioridad es encontrar un proyecto con un desafío técnico sólido y buen encaje cultural antes que apurarme.\n\n---",
    "category": "Technical",
    "tags": [
      "currently",
      "interviewing",
      "with",
      "other",
      "companies"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571640088
  },
  {
    "id": "base_38",
    "question": "How do you stay up-to-date with fast-evolving technologies?",
    "enText": "I read official engineering blogs (Google Cloud Architecture, Netflix Tech Blog, AWS Architecture), follow RFCs on GitHub, and test new tools hands-on in my dedicated home-lab environment before proposing them in production.",
    "esText": "Leo blogs oficiales de arquitectura (Google Cloud, Netflix, Uber), sigo RFCs en GitHub y experimento con las herramientas en mi propio home-lab antes de recomendarlas o aplicarlas en producción.\n\n---\n\n## CAPÍTULO 5: ARQUITECTURA DE SISTEMAS Y DISEÑO DISTRIBUIDO",
    "category": "Technical",
    "tags": [
      "stay",
      "uptodate",
      "with",
      "fastevolving",
      "technologies"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571641088
  },
  {
    "id": "base_39",
    "question": "How do you approach decomposing a monolithic application into microservices?",
    "enText": "I use the Strangler Fig pattern to migrate functionality progressively without a risky big-bang rewrite. I identify bounded contexts via Domain-Driven Design, start with low-risk asynchronous read services, decouple data models using the Database-per-Service pattern, and use event streaming or APIs to maintain eventual consistency.",
    "esText": "Aplico el patrón Strangler Fig para migrar progresivamente sin riesgo de un big-bang. Defino bounded contexts con DDD, comienzo por servicios de lectura asíncronos de bajo riesgo, desacoplo datos con Database-per-Service y uso eventos para consistencia eventual.\n\n---",
    "category": "Technical",
    "tags": [
      "approach",
      "decomposing",
      "monolithic",
      "application",
      "into",
      "microservices"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571642088
  },
  {
    "id": "base_40",
    "question": "How do you handle caching strategies and cache invalidation in high-traffic architectures?",
    "enText": "I implement Cache-Aside with Redis for read-heavy endpoints, pairing it with short TTLs and event-driven cache invalidation on mutations. To prevent the Thundering Herd (cache stampede) problem, I implement probabilistic early expiration (XFetch) or mutex locking so only one worker recalculates missing cache data.",
    "esText": "Implemento Cache-Aside con Redis para endpoints de alta lectura, con TTLs cortos e invalidación por eventos. Para evitar cache stampede (thundering herd), utilizo expiración probabilística temprana o locks distribuidos para que un solo worker recalcule el dato faltante.\n\n---",
    "category": "Technical",
    "tags": [
      "handle",
      "caching",
      "strategies",
      "cache",
      "invalidation",
      "hightraffic"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571643088
  },
  {
    "id": "base_41",
    "question": "How do you implement Rate Limiting and prevent API abuse?",
    "enText": "I deploy Redis-backed token bucket or sliding window counter algorithms at the API Gateway or ingress level. This allows fine-grained rate limits per IP, user token, or API key with sub-millisecond response times, returning HTTP 429 Too Many Requests with standard Retry-After headers.",
    "esText": "Implemento limitadores basados en Token Bucket o Sliding Window en Redis a nivel API Gateway. Esto permite límites granulares por IP, usuario o API key en submilisegundos, devolviendo HTTP 429 con headers Retry-After.\n\n---",
    "category": "Technical",
    "tags": [
      "implement",
      "rate",
      "limiting",
      "prevent",
      "abuse"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571644088
  },
  {
    "id": "base_42",
    "question": "What is the CAP Theorem and how do you navigate it in production?",
    "enText": "The CAP Theorem states that in the presence of a network partition (P), a distributed system must choose between Consistency (C) and Availability (A). For financial transactions and inventory, I prioritize Consistency (CP) using relational engines like PostgreSQL with ACID. For telemetry and caching, I choose Availability (AP) using distributed Redis or NoSQL with eventual consistency.",
    "esText": "Ante una partición de red (P), un sistema debe balancear Consistencia (C) o Disponibilidad (A). En transacciones financieras y cobros elijo Consistencia (CP) con bases relacionales ACID; en telemetría o analítica elijo Disponibilidad (AP) con consistencia eventual.\n\n---",
    "category": "Technical",
    "tags": [
      "what",
      "theorem",
      "navigate",
      "production"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571645088
  },
  {
    "id": "base_43",
    "question": "When do you use REST vs gRPC vs WebSockets vs Server-Sent Events (SSE)?",
    "enText": "- **REST:** My default for public CRUD APIs and third-party integrations due to broad tooling.\n- **gRPC:** For high-throughput internal microservice-to-microservice communication using HTTP/2 and binary Protocol Buffers.\n- **SSE:** For unidirectional server-to-client streaming (like LLM token generation or live dashboards).\n- **WebSockets:** For bidirectional real-time communication (like live chats or collaborative canvases).",
    "esText": "REST para APIs públicas; gRPC con HTTP/2 y Protocol Buffers para microservicios internos de alto rendimiento; SSE para streaming unidireccional de servidor a cliente (ej. tokens de LLM); y WebSockets para comunicación bidireccional en tiempo real.\n\n---",
    "category": "Technical",
    "tags": [
      "when",
      "rest",
      "grpc",
      "websockets",
      "serversent",
      "events"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571646088
  },
  {
    "id": "base_44",
    "question": "How do you design resilient microservices with Circuit Breaker and Retry patterns?",
    "enText": "I configure resilience policies using Circuit Breakers (tripping open when error thresholds exceed 50% over a 10s window) to prevent cascading failures. For transient network glitches, I use exponential backoff with full jitter to avoid overwhelming recovering upstream services.",
    "esText": "Configuro Circuit Breakers que se abren si la tasa de error supera un umbral para evitar fallas en cascada. Para errores de red transitorios uso reintentos con exponential backoff y jitter aleatorio para no saturar al servicio que se está recuperando.\n\n---",
    "category": "Technical",
    "tags": [
      "design",
      "resilient",
      "microservices",
      "with",
      "circuit",
      "breaker"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571647088
  },
  {
    "id": "base_45",
    "question": "How do you ensure Idempotency in API endpoints and distributed payments?",
    "enText": "I require clients to send a unique `Idempotency-Key` header with mutation requests (like POST /payments). I store the key in Redis with an atomic SETNX lock during processing. Once completed, the final response payload is cached against that key; identical retried requests instantly receive the cached response without re-executing logic.",
    "esText": "Exijo un header `Idempotency-Key` en operaciones críticas (como pagos). Guardo la key en Redis con lock atómico SETNX mientras procesa y guardo la respuesta final; si llega un reintento con la misma key, devuelvo la respuesta cacheada sin duplicar la transacción.\n\n---",
    "category": "Technical",
    "tags": [
      "ensure",
      "idempotency",
      "endpoints",
      "distributed",
      "payments"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571648088
  },
  {
    "id": "base_46",
    "question": "How do you handle distributed transactions across microservices without 2-Phase Commit?",
    "enText": "I use the Saga Pattern instead of blocking 2PC. In choreography or orchestration sagas, each microservice executes its local database transaction and publishes a domain event. If a subsequent step fails, compensating transactions are triggered in reverse order to restore consistency gracefully.",
    "esText": "Uso el patrón Saga en lugar del bloqueante Two-Phase Commit. Cada microservicio ejecuta su transacción local y publica un evento; si algún paso posterior falla, se ejecutan transacciones de compensación en orden inverso para revertir el estado limpiamente.\n\n---",
    "category": "Technical",
    "tags": [
      "handle",
      "distributed",
      "transactions",
      "across",
      "microservices",
      "without"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571649088
  },
  {
    "id": "base_47",
    "question": "What is the difference between synchronous request-response and event-driven architectures?",
    "enText": "Synchronous architectures (REST/gRPC) introduce temporal coupling: both services must be online simultaneously. Event-driven architectures (Pub/Sub, Kafka, Celery) decouple producers from consumers: producers emit events and return immediately, enabling horizontal scaling, traffic smoothing, and fault tolerance.",
    "esText": "La comunicación síncrona acopla temporalmente los servicios (ambos deben responder al instante). La arquitectura orientada a eventos desacopla productores y consumidores mediante colas, permitiendo amortiguar picos de tráfico y escalar de forma independiente.\n\n---",
    "category": "Technical",
    "tags": [
      "what",
      "difference",
      "between",
      "synchronous",
      "requestresponse",
      "eventdriven"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571650088
  },
  {
    "id": "base_48",
    "question": "How do you design authentication and authorization using JWT, Refresh Tokens, and OAuth2?",
    "enText": "I issue short-lived JWT access tokens (15-min expiry) containing minimal claims, paired with rotating, secure HTTP-only refresh tokens stored in Redis for revocation. For API authorization, I implement Role-Based Access Control (RBAC) and validate tokens at the API gateway layer before traffic touches internal services.",
    "esText": "Emite access tokens JWT de vida corta (15 min) con claims mínimos, junto con refresh tokens rotativos en cookies HTTP-only guardados en Redis para revocación inmediata. La autorización se valida con RBAC en el API Gateway antes de llegar a los microservicios.\n\n---",
    "category": "Technical",
    "tags": [
      "design",
      "authentication",
      "authorization",
      "using",
      "refresh",
      "tokens"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571651088
  },
  {
    "id": "base_49",
    "question": "How do you handle Data Contracts and schema evolution across distributed teams?",
    "enText": "I enforce explicit Data Contracts using Protobuf, OpenAPI, or Pydantic schemas stored in a central schema repository. Changes must maintain backward compatibility (adding optional fields only); breaking changes require creating a new API version endpoint (e.g. `/v2/`) with deprecation notices.",
    "esText": "Defino Data Contracts explícitos con OpenAPI o Protobuf. Todos los cambios deben mantener compatibilidad hacia atrás (solo campos opcionales nuevos); si hay un breaking change se crea una versión nueva (`/v2/`) con periodo de deprecación formal.\n\n---",
    "category": "Technical",
    "tags": [
      "handle",
      "data",
      "contracts",
      "schema",
      "evolution",
      "across"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571652088
  },
  {
    "id": "base_50",
    "question": "How do you design an observability strategy using Distributed Tracing?",
    "enText": "I inject standardized W3C trace-context headers across all HTTP and message broker boundaries. Using OpenTelemetry SDKs, spans capture database queries, external API calls, and errors. These traces flow into backends like Instana or Google Cloud Trace, allowing us to identify latency bottlenecks in p99 calls across microservices instantly.",
    "esText": "Propago headers de W3C trace-context en todas las llamadas HTTP y colas de mensajes. Con OpenTelemetry capturo spans de consultas SQL y llamadas externas hacia Instana o Cloud Trace, permitiendo detectar cuellos de botella en latencias p99 entre microservicios al instante.\n\n---\n\n## CAPÍTULO 6: CLOUD, DEVOPS, FINOPS Y SRE",
    "category": "Technical",
    "tags": [
      "design",
      "observability",
      "strategy",
      "using",
      "distributed",
      "tracing"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571653088
  },
  {
    "id": "base_51",
    "question": "How do you approach FinOps and cost optimization in Google Cloud?",
    "enText": "At Reforest Latam, I spearheaded a 28% reduction in monthly GCP spend. My strategy combines continuous compute rightsizing via Cloud Monitoring, elastic autoscaling, migrating steady workloads to Committed Use Discounts (CUDs), switching background jobs to spot VMs and Cloud Run, and enforcing GCS lifecycle rules for cold storage.",
    "esText": "En Reforest Latam redujimos un 28% mensual el gasto de GCP mediante right-sizing de instancias, autoscaling elástico, migración a Cloud Run, compra de CUDs (Committed Use Discounts) y ciclos de vida automáticos en Cloud Storage.\n\n---",
    "category": "Technical",
    "tags": [
      "approach",
      "finops",
      "cost",
      "optimization",
      "google",
      "cloud"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571654088
  },
  {
    "id": "base_52",
    "question": "What is your experience with Kubernetes, GKE Autopilot, and GitOps?",
    "enText": "I manage GKE Autopilot and Standard clusters configured with Horizontal Pod Autoscaling (HPA), Ingress controllers, and NetworkPolicies. I implement GitOps with ArgoCD and GitHub Actions for continuous reconciliation, and integrate automated container vulnerability scans using Trivy in the pipeline before pushing images to Artifact Registry.",
    "esText": "Manejo clusters GKE Standard y Autopilot con HPA, Ingress y NetworkPolicies. Implemento GitOps con ArgoCD y GitHub Actions para reconciliación continua sin downtime, y escaneo de imágenes con Trivy antes de publicarlas en Artifact Registry.\n\n---",
    "category": "Technical",
    "tags": [
      "what",
      "your",
      "experience",
      "with",
      "kubernetes",
      "autopilot"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571655088
  },
  {
    "id": "base_53",
    "question": "How do you structure Terraform for enterprise infrastructure and prevent state drift?",
    "enText": "I create reusable, semantic modules separated by lifecycle (Network, Compute, Database, IAM). State is stored remotely in GCS with object versioning and state locking. I manage multi-environment governance using Terragrunt, validate syntax with TFLint and Checkov, and automate deployments through CI/CD pipelines with manual approval gates for production applies.",
    "esText": "Creo módulos reutilizables separados por ciclo de vida (Red, Cómputo, Datos, IAM) con backend remoto en GCS con versionado y state locking. Uso Terragrunt para múltiples ambientes, TFLint/Checkov para análisis estático y pipelines de CI/CD con aprobación manual para producción.\n\n---",
    "category": "Technical",
    "tags": [
      "structure",
      "terraform",
      "enterprise",
      "infrastructure",
      "prevent",
      "state"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571656088
  },
  {
    "id": "base_54",
    "question": "How do you enforce Zero-Trust security and IAM least-privilege on GCP?",
    "enText": "I follow Zero-Trust: no direct public IPs on compute instances, strict Cloud Armor WAF on external Load Balancers, and dedicated Service Accounts with minimal custom roles. For Kubernetes workloads, I use Workload Identity instead of exporting static JSON keys, and store all secrets in Google Secret Manager with access audit logging.",
    "esText": "Aplico Zero-Trust: sin IPs públicas directas, Cloud Armor WAF en balanceadores y Service Accounts dedicadas de mínimo privilegio. En GKE uso Workload Identity para no exportar keys JSON y guardo secretos en Secret Manager con auditoría.\n\n---",
    "category": "Technical",
    "tags": [
      "enforce",
      "zerotrust",
      "security",
      "leastprivilege"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571657088
  },
  {
    "id": "base_55",
    "question": "What are the 4 Golden Signals in SRE and how do you monitor them?",
    "enText": "The 4 Golden Signals are Latency, Traffic, Errors, and Saturation. I monitor them using OpenTelemetry distributed tracing and Google Cloud Operations/Prometheus. I establish Service Level Objectives (SLOs) and alert on burning Error Budgets rather than noisy raw CPU spikes.",
    "esText": "Las 4 Golden Signals son Latencia, Tráfico, Errores y Saturación. Las monitoreo con OpenTelemetry y Prometheus/Cloud Operations, definiendo SLOs y alertando sobre consumo del Error Budget en vez de alertas ruidosas de CPU.\n\n---",
    "category": "Technical",
    "tags": [
      "what",
      "golden",
      "signals",
      "monitor",
      "them"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571658088
  },
  {
    "id": "base_56",
    "question": "How do you design Blue/Green vs Canary deployments?",
    "enText": "- **Canary:** I deploy new releases to a small percentage of pods (e.g. 5%) and route traffic using Ingress weights, monitoring error rates and p99 latency before rolling out 100%.\n- **Blue/Green:** I spin up a complete clone environment (Green), run sanity integration tests, and switch the Cloud Load Balancer backend target instantly with zero downtime.",
    "esText": "Canary dirige un porcentaje mínimo de tráfico (5%) a pods nuevos monitoreando latencia p99 y errores antes de completar el despliegue. Blue/Green levanta el ambiente completo en paralelo y conmuta el balanceador al instante con cero downtime.\n\n---",
    "category": "Technical",
    "tags": [
      "design",
      "bluegreen",
      "canary",
      "deployments"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571659088
  },
  {
    "id": "base_57",
    "question": "What is the difference between SLA, SLO, and SLI in SRE?",
    "enText": "- **SLI (Service Level Indicator):** A quantifiable metric measured in real-time (e.g. 99.2% of HTTP requests return status 200 in <200ms).\n- **SLO (Service Level Objective):** The internal target agreed with the business (e.g. 99.9% uptime over 30 days).\n- **SLA (Service Level Agreement):** The contractual commitment to customers with financial penalties if breached.",
    "esText": "SLI es la métrica real medida en vivo (ej. 99.2% de requests en <200ms); SLO es el objetivo interno acordado con el negocio (ej. 99.9% mensual); y SLA es el acuerdo legal/comercial con penalizaciones financieras ante incumplimientos.\n\n---",
    "category": "Technical",
    "tags": [
      "what",
      "difference",
      "between"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571660088
  },
  {
    "id": "base_58",
    "question": "How do you configure hybrid cloud connectivity with Cloud Interconnect and Cloud VPN?",
    "enText": "For high-bandwidth production traffic (GCVE and on-premises datacenters), I deploy Dedicated or Partner Cloud Interconnect with 10Gbps circuits and redundant SLAs. For branch offices or backup failover paths, I configure HA Cloud VPN using dual IPsec tunnels and dynamic BGP routing over Cloud Routers.",
    "esText": "Para tráfico masivo (GCVE o datacenter propio) uso Cloud Interconnect con circuitos de 10Gbps y SLA garantizado. Para redundancia o sitios secundarios configuro Cloud VPN de alta disponibilidad con túneles IPsec dobles y ruteo dinámico con BGP vía Cloud Routers.\n\n---",
    "category": "Technical",
    "tags": [
      "configure",
      "hybrid",
      "cloud",
      "connectivity",
      "with",
      "cloud"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571661088
  },
  {
    "id": "base_59",
    "question": "How do you handle secrets management and rotation across CI/CD and production?",
    "enText": "I eliminate static secrets in codebases using pre-commit hooks (Detect-secrets/TruffleHog). In GCP, secrets live in Google Secret Manager or HashiCorp Vault. Workloads access secrets dynamically via IAM roles or Workload Identity, and automated Cloud Functions handle credential rotation on a 90-day lifecycle.",
    "esText": "Elimino secretos en repositorios con linters pre-commit. Centralizo credenciales en Google Secret Manager o HashiCorp Vault. Las aplicaciones acceden dinámicamente vía Workload Identity y configuro Cloud Functions para rotación automática periódica cada 90 días.\n\n---",
    "category": "Technical",
    "tags": [
      "handle",
      "secrets",
      "management",
      "rotation",
      "across",
      "cicd"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571662088
  },
  {
    "id": "base_60",
    "question": "How do you build a Disaster Recovery Plan (DRP) with multi-region architectures?",
    "enText": "I define recovery strategies according to business RPO and RTO. For Tier-1 systems, I implement Active-Active multi-region deployments with Cloud Spanner or Cloud SQL cross-region replicas and global external HTTP(S) Load Balancers that automatically route healthy traffic away from an impacted region.",
    "esText": "Defino el plan según RPO y RTO. Para sistemas críticos uso arquitecturas Activo-Activo multi-región con réplicas cruzadas de bases de datos y balanceador global HTTP(S) que conmuta tráfico automáticamente si una región se cae.\n\n---\n\n## CAPÍTULO 7: KUBERNETES, CONTENEDORES Y DEVSECOPS",
    "category": "Technical",
    "tags": [
      "build",
      "disaster",
      "recovery",
      "plan",
      "with",
      "multiregion"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571663088
  },
  {
    "id": "base_61",
    "question": "What is the difference between GKE Autopilot and GKE Standard?",
    "enText": "GKE Standard gives full access to cluster nodes and OS kernels, requiring manual node pool provisioning and scaling. GKE Autopilot manages the entire underlying node infrastructure: Google provisions, scales, and hardens nodes automatically according to pod resource requests, charging only for requested pod vCPU, memory, and storage.",
    "esText": "GKE Standard da control total sobre los nodos y el kernel, requiriendo gestión manual de node pools. GKE Autopilot administra y escala los nodos automáticamente según los requests de los pods, cobrando únicamente por los recursos consumidos por los contenedores.\n\n---",
    "category": "Behavioral",
    "tags": [
      "what",
      "difference",
      "between",
      "autopilot",
      "standard"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571664088
  },
  {
    "id": "base_62",
    "question": "How do you troubleshoot a CrashLoopBackOff or OOMKilled pod in Kubernetes?",
    "enText": "First, run `kubectl describe pod` to inspect the termination state (e.g. Exit Code 137 indicates OOMKilled). Second, run `kubectl logs --previous` to see application stack traces right before crashing. If it's OOM, I analyze memory profiling and adjust the container memory limits in the manifest.",
    "esText": "Ejecuto `kubectl describe pod` para ver el estado de salida (código 137 significa OOMKilled por memoria). Luego reviso `kubectl logs --previous` para ver el stack trace antes de caer. Si es falta de memoria, ajusto los límites de memoria en el Deployment.\n\n---",
    "category": "Behavioral",
    "tags": [
      "troubleshoot",
      "crashloopbackoff",
      "oomkilled",
      "kubernetes"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571665088
  },
  {
    "id": "base_63",
    "question": "How do you build secure, lightweight Docker images with multi-stage builds?",
    "enText": "I use multi-stage Dockerfiles: the build stage installs compilers and dependencies, while the final runtime stage copies only the compiled binary or stripped virtualenv into a minimal, non-root distroless or Alpine base image. This shrinks image size from 1GB to <100MB and eliminates 95% of OS package vulnerabilities.",
    "esText": "Uso multi-stage builds: una etapa compila e instala paquetes, y la etapa final copia solo los binarios a una imagen base mínima (distroless o Alpine) corriendo con usuario sin privilegios root. Reduce el peso de 1GB a <100MB y elimina casi todas las vulnerabilidades.\n\n---",
    "category": "Behavioral",
    "tags": [
      "build",
      "secure",
      "lightweight",
      "docker",
      "images",
      "with"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571666088
  },
  {
    "id": "base_64",
    "question": "How do you implement automated container security scanning in CI/CD?",
    "enText": "I integrate Trivy and SonarQube as mandatory security gates in GitHub Actions/GitLab CI. Trivy scans the Docker image for OS and package CVEs before pushing to Artifact Registry, blocking any build that contains Critical or High vulnerabilities with available fixes.",
    "esText": "Integro Trivy y SonarQube en el pipeline de CI/CD. Trivy escanea la imagen Docker buscando vulnerabilidades CVE antes de subirla a Artifact Registry, cancelando el pipeline si detecta vulnerabilidades Críticas o Altas sin mitigar.\n\n---",
    "category": "Behavioral",
    "tags": [
      "implement",
      "automated",
      "container",
      "security",
      "scanning",
      "cicd"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571667088
  },
  {
    "id": "base_65",
    "question": "What are Kubernetes NetworkPolicies and why are they essential?",
    "enText": "By default, all pods in a Kubernetes cluster can communicate with each other freely. NetworkPolicies implement micro-segmentation: I enforce a default-deny ingress policy and explicitly whitelist only authorized communication (e.g. Frontend can only talk to Backend; only Backend can talk to Database on port 5432).",
    "esText": "Por defecto los pods en Kubernetes se comunican entre sí sin restricciones. Las NetworkPolicies aplican microsegmentación: defino default-deny y autorizo explícitamente solo las conexiones necesarias (ej. solo el Backend puede hablar con Postgres en el puerto 5432).\n\n---",
    "category": "Behavioral",
    "tags": [
      "what",
      "kubernetes",
      "networkpolicies",
      "they",
      "essential"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571668088
  },
  {
    "id": "base_66",
    "question": "What is the difference between Cluster Autoscaler and Horizontal Pod Autoscaler (HPA)?",
    "enText": "HPA scales the number of running pod replicas based on CPU, memory, or custom metrics (like request throughput). When existing cluster nodes run out of capacity to host those new pods, Cluster Autoscaler automatically provisions additional compute VMs (nodes) in the cloud provider to expand the cluster.",
    "esText": "HPA escala la cantidad de réplicas de pods según consumo de CPU, memoria o métricas de negocio. Cuando los nodos existentes se llenan y no entran más pods, el Cluster Autoscaler aprovisiona nuevas máquinas virtuales (nodos) en la nube para alojarlos.\n\n---",
    "category": "Behavioral",
    "tags": [
      "what",
      "difference",
      "between",
      "cluster",
      "autoscaler",
      "horizontal"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571669088
  },
  {
    "id": "base_67",
    "question": "What is the difference between ClusterIP, NodePort, and LoadBalancer services?",
    "enText": "- **ClusterIP:** Default internal-only IP reachable only inside the Kubernetes cluster.\n- **NodePort:** Opens a static high port (30000-32767) on each node VM IP.\n- **LoadBalancer:** Automatically provisions a cloud-provider load balancer (like Google Cloud Load Balancer) with an external IP pointing into the cluster.",
    "esText": "ClusterIP es para tráfico interno del cluster; NodePort abre un puerto en cada nodo; y LoadBalancer aprovisiona automáticamente un balanceador de carga en la nube con IP pública para recibir tráfico externo.\n\n---",
    "category": "Behavioral",
    "tags": [
      "what",
      "difference",
      "between",
      "clusterip",
      "nodeport",
      "loadbalancer"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571670088
  },
  {
    "id": "base_68",
    "question": "How does GitOps with ArgoCD work and what happens during configuration drift?",
    "enText": "Git is the single source of truth. ArgoCD continuously reconciles the live state of the Kubernetes cluster with the desired state defined in the Git repository. If someone modifies a cluster resource manually via kubectl (drift), ArgoCD detects the discrepancy and automatically resets it back to the Git definition.",
    "esText": "Git es la única fuente de verdad. ArgoCD reconcilia continuamente el estado real del cluster con el repositorio. Si alguien modifica algo a mano por `kubectl` (drift), ArgoCD detecta la diferencia y lo sobrescribe automáticamente con lo declarado en Git.\n\n---\n\n## CAPÍTULO 8: BASES DE DATOS, DBA Y DATA ENGINEERING",
    "category": "Behavioral",
    "tags": [
      "does",
      "gitops",
      "with",
      "argocd",
      "work",
      "what"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571671088
  },
  {
    "id": "base_69",
    "question": "How do you achieve RPO < 15 min and RTO < 1 hour in enterprise databases?",
    "enText": "At UBA across 8+ TB of data, we guaranteed RPO < 15 min by configuring continuous transactional log backups and streaming replication to standby instances. For RTO < 1 hour, we used automated health checks, pre-scripted failovers, and regular disaster recovery drill simulations.",
    "esText": "En la UBA (+8TB) logramos RPO < 15m con backups continuos de transaction logs y replicación por streaming a instancias standby. Para RTO < 1h usamos failover automatizado y simulacros periódicos de recuperación ante desastres.\n\n---",
    "category": "Behavioral",
    "tags": [
      "achieve",
      "hour",
      "enterprise",
      "databases"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571672088
  },
  {
    "id": "base_70",
    "question": "When do you choose PostgreSQL vs BigQuery vs Redis vs MongoDB?",
    "enText": "I pick storage based on access patterns: PostgreSQL for transactional ACID consistency and hybrid relational/vector search with pgvector; Redis for sub-millisecond distributed caching, rate limiting, and session state; BigQuery for petabyte-scale analytical queries and star-schema reporting; and MongoDB for highly dynamic, schema-less document payloads.",
    "esText": "Elijo por patrón de acceso: PostgreSQL para transacciones ACID y búsqueda vectorial con pgvector; Redis para caché sub-milisegundo y rate limiting; BigQuery para analítica a gran escala y reportes; y MongoDB para documentos sin esquema fijo.\n\n---",
    "category": "Behavioral",
    "tags": [
      "when",
      "choose",
      "postgresql",
      "bigquery",
      "redis",
      "mongodb"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571673088
  },
  {
    "id": "base_71",
    "question": "How do you diagnose and resolve database deadlocks and slow queries?",
    "enText": "I analyze the execution plan (using `EXPLAIN ANALYZE` or SQL Server Extended Events) to identify table scans, missing composite indexes, or index fragmentation. For deadlocks, I examine transaction lock graphs, ensure all queries acquire locks in the exact same deterministic order, and shorten transaction lifecycles by moving non-DB logic outside the transaction block.",
    "esText": "Analizo planes de ejecución (`EXPLAIN ANALYZE` o Extended Events) para detectar table scans o falta de índices compuestos. En deadlocks, reviso el grafo de bloqueos, fuerzo un orden idéntico de adquisición de tablas en todas las transacciones y acorto la duración de las transacciones sacando lógica ajena afuera.\n\n---",
    "category": "Behavioral",
    "tags": [
      "diagnose",
      "resolve",
      "database",
      "deadlocks",
      "slow",
      "queries"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571674088
  },
  {
    "id": "base_72",
    "question": "How do you design automated ELT pipelines with Apache Airflow and BigQuery?",
    "enText": "I design modular Airflow DAGs with idempotent tasks that extract source data, stage it into Cloud Storage, and load it into Google BigQuery using partitioning and clustering. I use Python with Polars and PyArrow for high-speed in-memory transformations, cutting daily batch processing windows by 60%.",
    "esText": "Diseño DAGs en Airflow con tareas idempotentes que extraen datos, los suben a GCS y los cargan en BigQuery particionado y clusterizado. Uso Polars y PyArrow para transformaciones ultrarrápidas en memoria, reduciendo un 60% los tiempos de procesamiento.\n\n---",
    "category": "Behavioral",
    "tags": [
      "design",
      "automated",
      "pipelines",
      "with",
      "apache",
      "airflow"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571675088
  },
  {
    "id": "base_73",
    "question": "How do you execute zero-downtime database schema migrations?",
    "enText": "I use the Expand and Contract pattern with tools like Alembic. First, add new columns or tables as optional (Expand). Second, deploy code that writes to both old and new columns. Third, backfill historical data. Finally, deprecate the old column and drop it in a subsequent release (Contract).",
    "esText": "Uso el patrón Expand and Contract con Alembic. Primero agrego columnas opcionales sin romper código previo; segundo despliego código que escribe en ambas; tercero migro datos históricos; y finalmente elimino la columna vieja en un release posterior.\n\n---",
    "category": "Behavioral",
    "tags": [
      "execute",
      "zerodowntime",
      "database",
      "schema",
      "migrations"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571676088
  },
  {
    "id": "base_74",
    "question": "How does database connection pooling work and why is PgBouncer essential?",
    "enText": "PostgreSQL allocates a dedicated process per connection (~2-10 MB memory each). Under high concurrency, thousands of connections exhaust CPU and memory due to context switching. PgBouncer acts as a lightweight proxy, maintaining a small pool of warm server connections (e.g. 50-100) and recycling them in transaction pooling mode.",
    "esText": "PostgreSQL crea un proceso por conexión. Con alta concurrencia, miles de conexiones colapsan la memoria por context switching. PgBouncer actúa de proxy liviano manteniendo un pool chico de conexiones calientes recicladas en modo transacción.\n\n---",
    "category": "Behavioral",
    "tags": [
      "does",
      "database",
      "connection",
      "pooling",
      "work",
      "pgbouncer"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571677088
  },
  {
    "id": "base_75",
    "question": "What is the difference between B-Tree, Hash, GIN, and Vector indexes?",
    "enText": "- **B-Tree:** Default index for sorting and equality/range comparisons (`=, <, >, BETWEEN`).\n- **Hash:** Optimized strictly for fast equality lookups (`=`).\n- **GIN (Generalized Inverted Index):** For composite elements like JSONB arrays, full-text search, and tags.\n- **HNSW / IVFFlat (pgvector):** Approximate Nearest Neighbor (ANN) index for high-dimensional AI vector embeddings.",
    "esText": "B-Tree para rangos y ordenamientos; Hash solo para igualdades; GIN para JSONB y búsquedas de texto; y HNSW / IVFFlat en pgvector para búsquedas semánticas y embeddings vectoriales de IA.\n\n---",
    "category": "Behavioral",
    "tags": [
      "what",
      "difference",
      "between",
      "btree",
      "hash",
      "vector"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571678088
  },
  {
    "id": "base_76",
    "question": "What is Database Normalization (3NF) vs Denormalization in Data Warehouses?",
    "enText": "In OLTP databases (PostgreSQL), I apply Third Normal Form (3NF) to minimize data redundancy and guarantee ACID transactional integrity. In OLAP Data Warehouses (BigQuery), I denormalize data into Star Schemas (fact and dimension tables) or nested JSON/RECORD fields to eliminate expensive multi-table JOIN operations.",
    "esText": "En bases transaccionales (OLTP) aplico 3NF para evitar redundancia y asegurar integridad ACID. En Data Warehouses (BigQuery) desnormalizo en esquemas estrella (tablas de hechos y dimensiones) para evitar JOINs costosos en consultas masivas.\n\n---",
    "category": "Behavioral",
    "tags": [
      "what",
      "database",
      "normalization",
      "denormalization",
      "data",
      "warehouses"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571679088
  },
  {
    "id": "base_77",
    "question": "What is Change Data Capture (CDC) and how do you stream database changes?",
    "enText": "CDC reads database write-ahead transaction logs (WAL in Postgres, transaction log in SQL Server) to capture inserts, updates, and deletes in real-time without polling tables. I stream these log events via tools like Debezium or Google Cloud Datastream into Pub/Sub and BigQuery for instant operational analytics.",
    "esText": "CDC lee el transaction log (WAL) de la base de datos para capturar altas, bajas y modificaciones en tiempo real sin hacer polling. Con herramientas como Debezium o Google Cloud Datastream se streamean los cambios a Pub/Sub y BigQuery al instante.\n\n---",
    "category": "Behavioral",
    "tags": [
      "what",
      "change",
      "data",
      "capture",
      "stream",
      "database"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571680088
  },
  {
    "id": "base_78",
    "question": "What is the difference between Optimistic and Pessimistic Concurrency Control?",
    "enText": "- **Pessimistic Locking (`SELECT FOR UPDATE`):** Locks rows immediately, preventing others from reading or writing until the transaction completes. Ideal for high-contention bank balances or seat reservations.\n- **Optimistic Locking:** Uses a `version` column. Transactions commit without locking, but fail if the version changed in the meantime. Ideal for low-contention architectures.",
    "esText": "Pessimistic locking bloquea las filas con `SELECT FOR UPDATE` para evitar modificaciones concurrentes (ideal para saldos bancarios). Optimistic locking usa una columna `version` sin bloquear, fallando solo si el registro cambió mientras se procesaba (ideal para baja contención).\n\n---\n\n## CAPÍTULO 9: BACKEND, PYTHON, MICROSERVICIOS Y GENAI",
    "category": "Behavioral",
    "tags": [
      "what",
      "difference",
      "between",
      "optimistic",
      "pessimistic",
      "concurrency"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571681088
  },
  {
    "id": "base_79",
    "question": "How do you design async APIs in Python with FastAPI and prevent blocking the event loop?",
    "enText": "I ensure all I/O operations (database queries with SQLAlchemy 2.0 AsyncEngine, external HTTP calls with httpx) use native `async`/`await`. Any CPU-heavy computation or blocking legacy libraries are delegated to Celery background workers or executed inside `asyncio.to_thread` to ensure the main event loop remains non-blocking and responsive.",
    "esText": "Uso `async`/`await` nativo para todo el I/O con SQLAlchemy 2.0 y `httpx`. Cualquier tarea bloqueante o pesada de CPU la delego a workers de Celery con Redis o a `asyncio.to_thread` para mantener el event loop siempre libre y rápido.\n\n---",
    "category": "Behavioral",
    "tags": [
      "design",
      "async",
      "apis",
      "python",
      "with",
      "fastapi"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571682088
  },
  {
    "id": "base_80",
    "question": "What is the Python GIL, why does it matter, and how do you handle it in production?",
    "enText": "The GIL (Global Interpreter Lock) in CPython prevents multiple native threads from executing Python bytecode at the same time. To achieve true parallel processing on multi-core CPUs, I scale horizontally using multiple worker processes via Gunicorn/Uvicorn, or offload heavy compute tasks to Celery workers in separate OS processes.",
    "esText": "El GIL en CPython asegura que solo un hilo ejecute bytecode a la vez. Para aprovechar múltiples núcleos en tareas intensivas de CPU, escalo horizontalmente con procesos workers en Gunicorn/Uvicorn o con colas de Celery en procesos separados.\n\n---",
    "category": "Behavioral",
    "tags": [
      "what",
      "python",
      "does",
      "matter",
      "handle",
      "production"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571683088
  },
  {
    "id": "base_81",
    "question": "How do you structure Clean Architecture and Domain-Driven Design (DDD) in Python?",
    "enText": "I isolate the core business domain from external frameworks. The Domain layer contains pure entities and value objects with no third-party imports. The Application layer orchestrates use cases. The Infrastructure layer implements adapters for databases (SQLAlchemy), message brokers, and APIs, following the Dependency Inversion Principle.",
    "esText": "Aíslo el dominio del negocio de frameworks externos. El Dominio contiene entidades y reglas de negocio puras; la capa de Aplicación orquesta casos de uso; y la Infraestructura implementa adaptadores de persistencia y APIs aplicando Inversión de Dependencias.\n\n---",
    "category": "Behavioral",
    "tags": [
      "structure",
      "clean",
      "architecture",
      "domaindriven",
      "design",
      "python"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571684088
  },
  {
    "id": "base_82",
    "question": "How do you integrate Generative AI or LLMs into backend architectures?",
    "enText": "I build Retrieval-Augmented Generation (RAG) pipelines integrating Google Cloud Vertex AI and OpenAI APIs. I generate embeddings, store and index them in PostgreSQL using `pgvector` or BigQuery Vector Search, implement cosine similarity retrieval with metadata filtering, and feed high-context prompts into the model with guardrails and latency caching.",
    "esText": "Desarrollo pipelines RAG conectando Vertex AI y OpenAI. Genero embeddings, los indexo en PostgreSQL con `pgvector` o BigQuery Vector Search, hago búsqueda por similitud de coseno con filtros y alimento prompts contextualizados con validación de respuestas y caché de latencia.\n\n---",
    "category": "Behavioral",
    "tags": [
      "integrate",
      "generative",
      "llms",
      "into",
      "backend",
      "architectures"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571685088
  },
  {
    "id": "base_83",
    "question": "How do you maintain >85% test coverage using Pytest and TDD?",
    "enText": "I structure tests into three levels: fast isolated unit tests with mock fixtures for domain logic, integration tests running against real ephemeral testcontainers (PostgreSQL/Redis in Docker), and contract tests for API schemas. I use `pytest-cov` in CI to fail builds if coverage drops below 85%.",
    "esText": "Divido tests en unitarios rápidos para lógica de negocio, de integración con contenedores efímeros de Docker (Postgres/Redis) y de contrato para APIs. Automatizo `pytest-cov` en CI para rechazar builds que bajen del 85% de cobertura.\n\n---",
    "category": "Behavioral",
    "tags": [
      "maintain",
      "test",
      "coverage",
      "using",
      "pytest"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571686088
  },
  {
    "id": "base_84",
    "question": "How do you manage background tasks and distributed queues with Celery and Redis?",
    "enText": "I configure Celery with Redis as the broker and result backend. I set tasks to be strictly idempotent with unique task IDs, configure exponential retry backoff for network calls, separate tasks into prioritized queues (e.g. `urgent`, `default`, `bulk`), and use Flower for real-time monitoring and worker dead-letter queues.",
    "esText": "Configuro Celery con Redis como broker. Aseguro que cada tarea sea idempotente con reintentos exponenciales, divido tareas en colas prioritarias (`urgent`, `default`, `bulk`) y uso Flower para monitoreo en vivo y dead-letter queues.\n\n---",
    "category": "Behavioral",
    "tags": [
      "manage",
      "background",
      "tasks",
      "distributed",
      "queues",
      "with"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571687088
  },
  {
    "id": "base_85",
    "question": "How do Python Generators and `yield` work and when do you use them?",
    "enText": "Generators produce values lazily one at a time using `yield`, rather than loading the entire collection into memory at once. I use them when streaming large datasets, parsing multi-gigabyte CSV/log files, or iterating over database query cursors to keep memory consumption virtually flat (O(1) space complexity).",
    "esText": "Los generadores usan `yield` para producir elementos bajo demanda en vez de cargar colecciones gigantes en RAM. Los uso al procesar archivos de logs masivos o cursores de bases de datos para mantener el consumo de memoria plano en O(1).\n\n---",
    "category": "Behavioral",
    "tags": [
      "python",
      "generators",
      "yield",
      "work",
      "when",
      "them"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571688088
  },
  {
    "id": "base_86",
    "question": "How does Dependency Injection work in FastAPI with `Depends`?",
    "enText": "FastAPI's `Depends` provides declarative dependency injection. I use it to inject database sessions, authenticated user contexts, rate limiters, and permission checks into path operations. It simplifies testing because I can easily override dependencies with mock fixtures in Pytest without changing route code.",
    "esText": "`Depends` en FastAPI resuelve inyección de dependencias declarativa. Lo uso para inyectar sesiones de base de datos, usuario autenticado y validaciones de permisos, lo que simplifica los tests al permitir sobrescribir dependencias con mocks fácilmente.\n\n---",
    "category": "Behavioral",
    "tags": [
      "does",
      "dependency",
      "injection",
      "work",
      "fastapi",
      "with"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571689088
  },
  {
    "id": "base_87",
    "question": "How do Python Decorators work under the hood?",
    "enText": "A decorator is a higher-order function that takes another function as an argument, wraps it with additional behavior, and returns the wrapped function without altering the original source code. I use decorators for cross-cutting concerns like execution timing, telemetry logging, auth checks, and caching.",
    "esText": "Un decorador es una función de orden superior que envuelve a otra función para extender su comportamiento sin modificar su código. Los uso para logging de telemetría, métricas de tiempo de ejecución, validación de permisos y caché.\n\n---",
    "category": "Behavioral",
    "tags": [
      "python",
      "decorators",
      "work",
      "under",
      "hood"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571690088
  },
  {
    "id": "base_88",
    "question": "What is the difference between shallow copy and deep copy in Python?",
    "enText": "- **Shallow Copy (`copy.copy()`):** Creates a new container object, but populates it with references to the original nested objects. Modifying a nested list affects both copies.\n- **Deep Copy (`copy.deepcopy()`):** Recursively creates completely independent clones of both the container and all nested objects, preventing any side effects.",
    "esText": "Shallow copy clona el contenedor pero mantiene referencias a los objetos anidados (modificar un anidado altera ambos). Deep copy clona recursivamente toda la estructura en posiciones de memoria independientes sin efectos colaterales.\n\n---\n\n## CAPÍTULO 10: FRONTEND MODERNO Y FULL STACK",
    "category": "Behavioral",
    "tags": [
      "what",
      "difference",
      "between",
      "shallow",
      "copy",
      "deep"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571691088
  },
  {
    "id": "base_89",
    "question": "How do you optimize Core Web Vitals in Next.js applications?",
    "enText": "I optimize Largest Contentful Paint (LCP < 1.2s) and Cumulative Layout Shift (CLS < 0.05) by leveraging Next.js React Server Components (RSC) to minimize client-side JavaScript, using next/image with explicit dimensions and modern WebP/AVIF formats, dynamic imports for below-the-fold modules, and stale-while-revalidate caching.",
    "esText": "Optimizo LCP (< 1.2s) y CLS (< 0.05) usando Server Components (RSC) para reducir el bundle JS de cliente, `next/image` con tamaños explícitos en formatos WebP/AVIF, importaciones dinámicas para componentes fuera del viewport y caché stale-while-revalidate.\n\n---",
    "category": "Behavioral",
    "tags": [
      "optimize",
      "core",
      "vitals",
      "nextjs",
      "applications"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571692088
  },
  {
    "id": "base_90",
    "question": "How do React 18 Server Components (RSC) differ from Client Components?",
    "enText": "Server Components execute strictly on the server: they have direct zero-latency access to databases, keep sensitive credentials secure, and produce zero JavaScript in the client bundle. Client Components (marked with `'use client'`) add interactivity, event handlers, and browser hooks (`useState`, `useEffect`).",
    "esText": "Los Server Components corren 100% en el servidor: acceden directo a la base de datos sin latencia y no suman peso al bundle JS del cliente. Los Client Components (`'use client'`) se usan donde hay interactividad, eventos y hooks como `useState`.\n\n---",
    "category": "Behavioral",
    "tags": [
      "react",
      "server",
      "components",
      "differ",
      "from",
      "client"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571693088
  },
  {
    "id": "base_91",
    "question": "How do you manage frontend state between TanStack Query and Global Stores?",
    "enText": "I separate server-state from client-state. I use TanStack Query (React Query) for all asynchronous server data: it handles automatic caching, background refetching, and deduplication out of the box. I reserve global state stores like Redux Toolkit or Zustand strictly for UI state (e.g. modals, active filters, theme).",
    "esText": "Separo estado de servidor y de cliente. Uso TanStack Query para toda la data asíncrona de APIs por su caché automático y refetch en segundo plano. Dejo Redux Toolkit o Zustand exclusivamente para estado de UI (filtros, modales o temas).\n\n---",
    "category": "Architecture",
    "tags": [
      "manage",
      "frontend",
      "state",
      "between",
      "tanstack",
      "query"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571694088
  },
  {
    "id": "base_92",
    "question": "How do you ensure Web Accessibility (WCAG 2.1) and responsive design?",
    "enText": "I build mobile-first with Tailwind CSS and semantic HTML5 tags (`main`, `nav`, `section`, `article`). I ensure full keyboard navigation, explicit ARIA labels and roles for screen readers, and maintain high color contrast ratios validated with Lighthouse and axe-core automated audits.",
    "esText": "Diseño mobile-first con Tailwind CSS y HTML5 semántico. Garantizo navegación por teclado, roles y etiquetas ARIA para lectores de pantalla, y verifico contraste de color con auditorías automatizadas de Lighthouse y axe-core.\n\n---",
    "category": "Architecture",
    "tags": [
      "ensure",
      "accessibility",
      "wcag",
      "responsive",
      "design"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571695088
  },
  {
    "id": "base_93",
    "question": "What is the difference between SSR, SSG, and ISR in Next.js?",
    "enText": "- **SSG (Static Site Generation):** HTML is generated once at build time for instant delivery via CDN.\n- **SSR (Server-Side Rendering):** HTML is rendered dynamically on each incoming client request.\n- **ISR (Incremental Static Regeneration):** Combines both: static pages are served from CDN and regenerated in the background at set intervals (e.g. every 60s) without rebuilding the whole app.",
    "esText": "SSG compila HTML en build time para CDN; SSR renderiza en el servidor en cada request; e ISR sirve páginas estáticas desde CDN y las regenera en segundo plano tras un periodo de revalidación sin rebuild completo.\n\n---",
    "category": "Architecture",
    "tags": [
      "what",
      "difference",
      "between",
      "nextjs"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571696088
  },
  {
    "id": "base_94",
    "question": "How do you prevent memory leaks and unneeded re-renders in React?",
    "enText": "I clean up side effects in `useEffect` (clearing event listeners, timers, and aborting fetch requests with `AbortController`). I use `useCallback` and `useMemo` strategically for expensive computations or callbacks passed to memoized children (`React.memo`), and avoid declaring object literals inside render loops.",
    "esText": "Limpio subscripciones y cancelo peticiones con `AbortController` en `useEffect`. Uso `useMemo` y `useCallback` en cálculos pesados o funciones pasadas a componentes memoizados, y evito instanciar objetos en el cuerpo de render.\n\n---\n\n## CAPÍTULO 11: SAP CLOUD INFRASTRUCTURE, GCVE Y VMWARE",
    "category": "Architecture",
    "tags": [
      "prevent",
      "memory",
      "leaks",
      "unneeded",
      "rerenders",
      "react"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571697088
  },
  {
    "id": "base_95",
    "question": "How do you configure High Availability for SAP on Google Cloud?",
    "enText": "I deploy two SAP nodes across different availability zones on SUSE Linux (SLES 15 SP7), configuring Pacemaker and Corosync with GCP Fence Agents for STONITH fencing. Storage is tuned on block-aligned XFS over LVM, and HANA System Replication (HSR) ensures real-time memory synchronization with zero data loss.",
    "esText": "Despliego dos nodos en zonas distintas de GCP sobre SUSE Linux (SLES 15), configuro Pacemaker y Corosync con GCP Fence Agents para STONITH, storage alineado con XFS/LVM y replicación HANA System Replication (HSR) en tiempo real.\n\n---",
    "category": "Architecture",
    "tags": [
      "configure",
      "high",
      "availability",
      "google",
      "cloud"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571698088
  },
  {
    "id": "base_96",
    "question": "What is your hands-on experience with Google Cloud VMware Engine (GCVE) and VMware?",
    "enText": "I manage VMware environments (vSphere, ESXi, vCenter, vSAN, NSX-T) and their hybrid integration into Google Cloud via GCVE. I design private clouds in GCVE connected through Cloud Interconnect or VPN to native GCP VPCs, and use VMware HCX for zero-downtime live vMotion migrations from on-premise datacenters.",
    "esText": "Administro vSphere, ESXi, vCenter, vSAN y NSX-T. En Google Cloud configuro GCVE conectado por Private Service Access o Cloud Interconnect a la VPC, usando VMware HCX para migraciones en caliente con vMotion sin downtime.\n\n---",
    "category": "Architecture",
    "tags": [
      "what",
      "your",
      "handson",
      "experience",
      "with",
      "google"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571699088
  },
  {
    "id": "base_97",
    "question": "Why choose GCVE over migrating directly to native Compute Engine VMs?",
    "enText": "It comes down to migration velocity and risk mitigation: GCVE enables a pure Lift-and-Shift of enterprise legacy workloads without refactoring application code, altering OS kernels, or changing network IPs. It provides a stable landing zone using familiar VMware tools before modernizing workloads into GKE or Cloud Run.",
    "esText": "GCVE permite un Lift & Shift inmediato sin reescribir aplicaciones, manteniendo las IPs, el kernel y herramientas conocidas (vCenter/NSX-T) con migración en caliente vía HCX, antes de modernizar a servicios nativos.\n\n---",
    "category": "Architecture",
    "tags": [
      "choose",
      "gcve",
      "over",
      "migrating",
      "directly",
      "native"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571700088
  },
  {
    "id": "base_98",
    "question": "How do you tune Linux kernel settings with `saptune` for SAP HANA workloads?",
    "enText": "I apply `saptune` daemon profiles tailored for SAP HANA and NetWeaver on SLES 15. It automatically tunes kernel parameters: configuring HugePages, optimizing dirty memory background ratios, setting `sysctl` IPC limits, disabling CPU frequency governors (setting performance mode), and tuning network buffer TCP windows.",
    "esText": "Aplico perfiles de `saptune` para SAP HANA en SLES 15. Ajusta parámetros del kernel: configura HugePages, optimiza dirty ratios de memoria, ajusta límites IPC con `sysctl`, desactiva throttling de CPU (modo performance) y agranda buffers TCP de red.\n\n---",
    "category": "Architecture",
    "tags": [
      "tune",
      "linux",
      "kernel",
      "settings",
      "with",
      "saptune"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571701088
  },
  {
    "id": "base_99",
    "question": "What is VMware HCX and what are the main migration types?",
    "enText": "VMware HCX (Hybrid Cloud Extension) provides workload mobility across on-premises and clouds. It offers three migration mechanisms:\n- **vMotion Live Migration:** Zero-downtime hot migration for mission-critical VMs.\n- **Bulk Migration:** Replicates disk data in the background using vSphere Replication, with a scheduled reboot cutover.\n- **Cold Migration:** Migrates powered-off VMs.",
    "esText": "VMware HCX facilita la movilidad de VMs hacia la nube. Ofrece vMotion en caliente sin downtime para VMs críticas; Bulk Migration para sincronizar datos en segundo plano y reiniciar en una ventana acordada; y Cold Migration para máquinas apagadas.\n\n---",
    "category": "Architecture",
    "tags": [
      "what",
      "vmware",
      "what",
      "main",
      "migration",
      "types"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571702088
  },
  {
    "id": "base_100",
    "question": "Why is STONITH fencing mandatory in high-availability clusters?",
    "enText": "STONITH (Shoot The Other Node In The Head) prevents Split-Brain scenarios. If the heartbeat network between nodes fails, both nodes might believe they are the sole survivor and try to mount shared storage simultaneously, causing catastrophic data corruption. STONITH forcefully powers down the unresponsive node via GCP Fence Agents before promoting the survivor.",
    "esText": "STONITH evita el escenario de Split-Brain. Si la red de heartbeat falla, ambos nodos podrían creerse activos y escribir sobre el mismo storage corruptiendo los datos. STONITH apaga forzosamente al nodo fallido mediante GCP Fence Agents antes de promover al sobreviviente.\n\n---\n\n## CAPÍTULO 12: CONDICIONES, NEGOCIACIÓN, LOGÍSTICA Y CIERRE",
    "category": "Architecture",
    "tags": [
      "stonith",
      "fencing",
      "mandatory",
      "highavailability",
      "clusters"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571703088
  },
  {
    "id": "base_101",
    "question": "What are your salary expectations or hourly rate?",
    "enText": "For a Senior role, my target hourly rate is between **$23 and $26 USD per hour**, which corresponds to approximately **$3,700 to $4,200 USD per month** for full-time work. I have my international export invoicing ready to go.",
    "esText": "Para una posición senior, mi tarifa horaria pretendida está entre **23 y 26 USD la hora**, lo que representa aproximadamente **3.700 a 4.200 USD mensuales** a dedicación completa. Tengo mi facturación de exportación 100% operativa.\n\n---",
    "category": "Architecture",
    "tags": [
      "what",
      "your",
      "salary",
      "expectations",
      "hourly",
      "rate"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571704088
  },
  {
    "id": "base_102",
    "question": "¿Cuáles son tus pretensiones salariales o tarifa para este puesto?",
    "enText": "My target rate is between $23 and $26 USD per hour ($3,700 to $4,200 USD/month).",
    "esText": "Para una posición senior, mi tarifa horaria pretendida está entre **23 y 26 USD la hora**, lo que representa aproximadamente **3.700 a 4.200 USD mensuales** a dedicación completa. Tengo mi facturación de exportación 100% operativa.",
    "category": "Architecture",
    "tags": [
      "cules",
      "pretensiones",
      "salariales",
      "tarifa",
      "para",
      "este"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571705088
  },
  {
    "id": "base_103",
    "question": "What is your current availability to start a new role?",
    "enText": "I have immediate availability, or standard 1 to 2 weeks if a handover is needed. I'm ready to onboard smoothly as soon as we align on the next steps.",
    "esText": "Tengo disponibilidad inmediata, o de 1 a 2 semanas de preaviso si hace falta una transición ordenada. Estoy listo para sumarme en cuanto coordinemos.\n\n---",
    "category": "Architecture",
    "tags": [
      "what",
      "your",
      "current",
      "availability",
      "start",
      "role"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571706088
  },
  {
    "id": "base_104",
    "question": "Do you prefer contractor or direct payroll modality?",
    "enText": "I'm very flexible. I'm fully set up for Contractor engagements with direct international export invoicing and platforms like Deel, Ontop, or wire transfers. I'm also open to direct local payroll if the proposal makes sense.",
    "esText": "Tengo total flexibilidad: estoy 100% operativo para facturar como Contractor (Deel, Ontop, transferencia internacional directa) y también abierto a relación de dependencia si la propuesta lo contempla.\n\n---",
    "category": "Architecture",
    "tags": [
      "prefer",
      "contractor",
      "direct",
      "payroll",
      "modality"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571707088
  },
  {
    "id": "base_105",
    "question": "How do you organize your routine working 100% remotely?",
    "enText": "I've been working remotely for over 8 years. I have a dedicated home office, dual high-speed fiber internet connections, and a structured daily routine. I plan my priorities the evening before, communicate proactively on Slack, and document technical decisions asynchronously.",
    "esText": "Trabajo en remoto hace más de 8 años con oficina propia, doble conexión de fibra óptica y rutina ordenada. Planifico el día anterior, mantengo comunicación fluida en Slack y documento todo de forma asíncrona.\n\n---",
    "category": "Architecture",
    "tags": [
      "organize",
      "your",
      "routine",
      "working",
      "remotely"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571708088
  },
  {
    "id": "base_106",
    "question": "How comfortable are you working and communicating in English on a daily basis?",
    "enText": "I'm very comfortable with daily technical communication. I write documentation, read RFCs, and participate in agile ceremonies in English. While my natural environment is technical, I actively practice conversational English to keep my speaking fast and spontaneous.",
    "esText": "Me siento muy cómodo con la comunicación técnica diaria. Redacto documentación, leo RFCs y participo en ceremonias ágiles en inglés. Además practico conversación habitualmente para mantener la espontaneidad.\n\n---",
    "category": "Architecture",
    "tags": [
      "comfortable",
      "working",
      "communicating",
      "english",
      "daily",
      "basis"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571709088
  },
  {
    "id": "base_107",
    "question": "Do you have any questions for me about the company or the hiring process?",
    "enText": "Yes, I'd love to ask:\n1. What does the typical day-to-day look like for this engineering team?\n2. What is the biggest architectural or operational challenge you're currently tackling?\n3. What are the next steps in the interview process after our conversation today?",
    "esText": "Sí, me gustaría consultar:\n1. ¿Cómo es el día a día típico en este equipo de ingeniería?\n2. ¿Cuál es el mayor desafío de arquitectura u operación que están resolviendo hoy?\n3. ¿Cuáles son los próximos pasos en el proceso después de esta charla?",
    "category": "Architecture",
    "tags": [
      "have",
      "questions",
      "about",
      "company",
      "hiring",
      "process"
    ],
    "company": "General",
    "role": "General",
    "favorite": false,
    "createdAt": 1789571710088
  }
];
