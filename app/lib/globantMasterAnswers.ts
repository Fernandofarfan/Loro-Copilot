import { MasterAnswer } from "./interviewHelpers";

/**
 * Banco Globant/Intermedia — alineado al CV EN_Cloud_DevOps_Architect.pdf
 * y al JD de GCP Cloud Engineer (Intermedia para Globant).
 *
 * Reglas: sonar humano, no IA. Sin porcentajes ni números duros en el
 * diálogo hablado. Sin viñetas. Un párrafo fluido, 2 oraciones máximo.
 * Los números del CV (28%, 70%, 99.9%) quedan para cuando Fernando
 * los menciona naturalmente en la entrevista, no para que la IA los lea.
 */
export const GLOBANT_AND_GCP_MASTER_ANSWERS: MasterAnswer[] = [
  // ─────────────────────────────────────────────
  // PRESENTACIÓN — 45–60 s, matching el CV
  // ─────────────────────────────────────────────
  {
    "id": "globant_tell_me_about_yourself",
    "question": "Tell me about yourself or walk me through your CV.",
    "enText": "I'm Fernando, a Cloud and DevOps Engineer based in Salta, Argentina. I've been working in IT for over eight years in systems, backend, and infrastructure, and the last few years have been almost entirely on GCP, Terraform, Linux, and Kubernetes. Most recently at Reforest I led a small platform team, built GitOps pipelines, and helped significantly reduce the monthly cloud bill. Before that I did Terraform modules and hybrid DR for enterprise clients, and at the city government I kept uptime across DNS and Windows environments. I'm looking to go deeper into enterprise GCP and GCVE, which is why this project with Globant caught my attention.",
    "esText": "Soy Fernando, ingeniero Cloud y DevOps en Salta. Llevo más de ocho años en IT en sistemas, backend e infraestructura, y los últimos años han sido casi enteramente en GCP, Terraform, Linux y Kubernetes. En Reforest lideré un equipo pequeño de plataforma, armé pipelines GitOps y ayudé a reducir bastante la factura de cloud. Antes diseñé módulos de Terraform y DR híbrido para clientes enterprise, y en el gobierno de la ciudad mantuve la disponibilidad en DNS e infraestructura Windows. Busco profundizar en GCP y GCVE enterprise, por eso este proyecto de Globant me llamó la atención.",
    "category": "Screening",
    "tags": [
      "tell me about yourself",
      "walk me through",
      "cv",
      "background",
      "introduction"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  // ─────────────────────────────────────────────
  // AÑOS DE EXPERIENCIA — +8 IT / ~4 cloud
  // ─────────────────────────────────────────────
  {
    "id": "globant_experience_strict",
    "question": "How many years of experience do you have in cloud and software engineering?",
    "enText": "I have over eight years total in IT across backend systems, databases, and infrastructure. The last three or four have been focused specifically on GCP, Terraform, and Linux. So my general IT background is broad, and the cloud part is where I've been going deep recently.",
    "esText": "Sumo más de ocho años totales en IT, en backend, bases de datos e infraestructura. Los últimos tres o fueron específicamente en GCP, Terraform y Linux. Mi base general es amplia, y el área de cloud es donde me he profundizado más recientemente.",
    "category": "Screening",
    "tags": [
      "experience",
      "years",
      "how many",
      "cloud"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  // ─────────────────────────────────────────────
  // INGLÉS — B2, nunca C1/C2
  // ─────────────────────────────────────────────
  {
    "id": "globant_english_level",
    "question": "How would you describe your English level?",
    "enText": "I'd say professional working level, around B2. I write documentation, read RFCs, and participate in agile ceremonies in English every day. In technical conversations I'm very comfortable, and I'm always working on being more spontaneous in my speaking.",
    "esText": "Diría que nivel profesional, alrededor de B2. Redacto documentación, leo RFCs y participo en ceremonias ágiles en inglés todos los días. En conversaciones técnicas me siento muy cómodo, y siempre estoy trabajando para ganar más espontaneidad al hablar.",
    "category": "Screening",
    "tags": [
      "english",
      "level",
      "proficiency",
      "language",
      "fluency"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  // ─────────────────────────────────────────────
  // TÍTULO / EDUCACIÓN
  // ─────────────────────────────────────────────
  {
    "id": "globant_education",
    "question": "What is your educational background or degree?",
    "enText": "I'm currently advancing in Systems Engineering at UTN, expected around 2027. I also studied Labor Relations at UBA a few years back. My main certifications are Google Cloud Foundations, IBM AI Engineering, and Meta Backend Developer. Most of what I know comes from hands-on production work, to be honest.",
    "esText": "Estoy avanzando en Ingeniería en Sistemas en la UTN, para más o menos 2027. También estudié Relaciones del Trabajo en la UBA hace unos años. Mis certificaciones principales son Google Cloud Foundations, IBM AI Engineering y Meta Backend Developer. La mayor parte de lo que sé viene del trabajo práctico en producción, siendo honesto.",
    "category": "Screening",
    "tags": [
      "education",
      "degree",
      "university",
      "utn",
      "uba",
      "certification"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  // ─────────────────────────────────────────────
  // POR QUÉ CAMBIAR
  // ─────────────────────────────────────────────
  {
    "id": "globant_why_change",
    "question": "Why are you looking for a change or open to new opportunities?",
    "enText": "I want to focus more on enterprise-scale GCP infrastructure, especially hybrid environments with GCVE and VMware. My current work covers a wide range of cloud tasks, but this project with Globant is exactly the kind of deep infrastructure work I want to do next.",
    "esText": "Quiero enfocarme más en infraestructura GCP enterprise, especialmente entornos híbridos con GCVE y VMware. Mi trabajo actual cubre un rango amplio de tareas cloud, pero este proyecto con Globant es exactamente el tipo de infraestructura profunda que quiero hacer a continuación.",
    "category": "Screening",
    "tags": [
      "why change",
      "looking for",
      "motivation",
      "reason"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  // ─────────────────────────────────────────────
  // DISPONIBILIDAD / START
  // ─────────────────────────────────────────────
  {
    "id": "globant_availability",
    "question": "When could you start or what is your availability?",
    "enText": "I have immediate availability, or up to two weeks if a handover is needed. I'm flexible and ready to align on whatever date works best for the team.",
    "esText": "Tengo disponibilidad inmediata, o hasta dos semanas si hace falta una transición ordenada. Soy flexible y estoy listo para alinearme con la fecha que mejor funcione para el equipo.",
    "category": "Screening",
    "tags": [
      "availability",
      "start date",
      "when",
      "notice period"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  // ─────────────────────────────────────────────
  // REFOREST — natural, sin métricas duras
  // ─────────────────────────────────────────────
  {
    "id": "globant_reforest_role",
    "question": "Tell me about your current role at Reforest.",
    "enText": "I lead a small platform team working on cloud infrastructure and FinOps on GCP. We cut costs quite a bit through rightsizing and committed use discounts, and I built provisioning pipelines with Terraform that went from days to minutes. We also moved workloads to GKE Autopilot and set up ArgoCD for GitOps deployments.",
    "esText": "Lidero un equipo pequeño de plataforma trabajando en infraestructura cloud y FinOps en GCP. Redujimos los costos bastante con right-sizing y committed use discounts, y armé pipelines de aprovisionamiento con Terraform que pasaron de tardar días a minutos. También migramos workloads a GKE Autopilot y configuramos ArgoCD para despliegues GitOps.",
    "category": "Screening",
    "tags": [
      "reforest",
      "current role",
      "platform team",
      "finops",
      "gke"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_reforest_finops",
    "question": "Tell me more about the cost reduction at Reforest.",
    "enText": "I audited the full GCP billing and found a lot of oversized instances and idle resources. I applied committed use discounts, resized VMs based on Recommender, moved cold storage to cheaper tiers, and automated shutdown of non-production environments off-hours. The result was a significant monthly reduction without hurting performance.",
    "esText": "Audité toda la facturación de GCP y encontré muchas instancias sobredimensionadas y recursos ociosos. Apliqué committed use discounts, redimensioné VMs con Recommender, moví almacenamiento frío a tiers más baratos y automatizé el apagado de entornos no productivos fuera de horario. El resultado fue una reducción mensual bastante significativa sin afectar la performance.",
    "category": "Technical",
    "tags": [
      "finops",
      "cost reduction",
      "billing",
      "gcp"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  // ─────────────────────────────────────────────
  // CONSULTING — natural
  // ─────────────────────────────────────────────
  {
    "id": "globant_consulting_role",
    "question": "What did you do at the consulting firm?",
    "enText": "I designed reusable Terraform modules for enterprise clients, set up monitoring with Instana and OpenTelemetry, and built a DR environment for a SAP client running on SUSE Linux. I also managed GKE clusters and automated the provisioning pipeline end to end.",
    "esText": "Diseñé módulos reutilizables de Terraform para clientes enterprise, configuré monitoreo con Instana y OpenTelemetry, y construí un entorno de DR para un cliente SAP en SUSE Linux. También administré clusters GKE y automatiqué el pipeline de aprovisionamiento de punta a punta.",
    "category": "Screening",
    "tags": [
      "consulting",
      "terraform",
      "instana",
      "sap",
      "gke"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_infoblox_dr",
    "question": "Tell me about the Infoblox disaster recovery project.",
    "enText": "We migrated enterprise DNS and DHCP using Infoblox, designed a full DR environment with secondary nodes and automated zone transfer. The goal was zero-downtime failover for DNS resolution across multiple sites. I also built automation scripts and security remediation for the Infoblox infrastructure.",
    "esText": "Migramos DNS y DHCP enterprise con Infoblox, diseñamos un entorno completo de DR con nodos secundarios y transferencia automática de zonas. El objetivo era failover sin downtime para la resolución DNS en múltiples sitios. También armé scripts de automatización y remediación de seguridad para la infraestructura Infoblox.",
    "category": "Technical",
    "tags": [
      "infoblox",
      "dns",
      "dhcp",
      "disaster recovery",
      "migration"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_sap_experience",
    "question": "What is your experience with SAP infrastructure?",
    "enText": "I supported SAP workloads on SUSE Linux with Pacemaker and Corosync for high availability clustering. My work covered storage design with XFS and LVM for performance, Terraform automation, and tuning for SAP HANA. I also handled automated patching on SLES.",
    "esText": "Trabajé con cargas SAP en SUSE Linux con Pacemaker y Corosync para clustering de alta disponibilidad. Mi trabajo abarcó diseño de storage con XFS y LVM para performance, automatización con Terraform y tuning para SAP HANA. También gestioné patching automático en SLES.",
    "category": "Technical",
    "tags": [
      "sap",
      "suse",
      "pacemaker",
      "hana",
      "linux"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  // ─────────────────────────────────────────────
  // GCBA — natural
  // ─────────────────────────────────────────────
  {
    "id": "globant_gcba_role",
    "question": "Tell me about your role at the city government (GCBA).",
    "enText": "I was a systems engineer maintaining high-availability infrastructure. I managed DNS services with Infoblox, kept uptime across the environment, and did Windows Server upgrades with zero downtime through planned maintenance windows. It was a good experience working with government-scale infrastructure.",
    "esText": "Fui ingeniero de sistemas manteniendo infraestructura de alta disponibilidad. Gestioné servicios DNS con Infoblox, mantuve la disponibilidad del entorno e hice upgrades de Windows Server sin downtime con ventanas de mantenimiento planificadas. Fue una buena experiencia trabajando con infraestructura a escala gubernamental.",
    "category": "Screening",
    "tags": [
      "gcba",
      "government",
      "dns",
      "infoblox",
      "ha"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_uba_overlap",
    "question": "You worked at UBA for several years while doing consulting. How did that work?",
    "enText": "My role at UBA was part-time and focused on database administration during scheduled maintenance windows. That gave me full schedule predictability, so I could dedicate full time to consulting and cloud engineering. The overlap was manageable because the UBA work was planned and periodic, not on-call.",
    "esText": "Mi rol en la UBA fue part-time, enfocado en administración de bases de datos durante ventanas de mantenimiento programadas. Eso me dio previsibilidad total, así que podía dedicarme full-time a consultoría e ingeniería cloud. El solape fue manejable porque el trabajo en UBA era planificado y periódico, no de guardia.",
    "category": "Screening",
    "tags": [
      "uba",
      "overlap",
      "consulting",
      "part-time"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  // ─────────────────────────────────────────────
  // FIREWALLS
  // ─────────────────────────────────────────────
  {
    "id": "globant_firewalls",
    "question": "What is your experience with firewalls and network security?",
    "enText": "On GCP I configure Cloud Armor at the load balancer for DDoS protection and WAF rules. For VPC-level controls I use native firewall rules with priority-based filtering and VPC Flow Logs. In my consulting work I also configured Palo Alto and Fortinet appliances in on-premise and hybrid environments.",
    "esText": "En GCP configuro Cloud Armor en el balanceador para protección DDoS y reglas WAF. Para controles a nivel VPC uso reglas de firewall nativas con filtrado por prioridad y VPC Flow Logs. En consultoría también configuré appliances de Palo Alto y Fortinet en entornos on-premise e híbridos.",
    "category": "Technical",
    "tags": [
      "firewall",
      "cloud armor",
      "security",
      "palo alto",
      "fortinet"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  // ─────────────────────────────────────────────
  // PYTHON
  // ─────────────────────────────────────────────
  {
    "id": "globant_python_automation",
    "question": "How do you use Python for infrastructure automation?",
    "enText": "I build serverless automations on Cloud Functions and Cloud Scheduler using the official GCP SDKs. One example is automating snapshot lifecycles and cleaning up orphaned disks to reduce idle storage costs. I also wrote remediation scripts triggered by audit logs for security compliance.",
    "esText": "Armo automatizaciones serverless en Cloud Functions y Cloud Scheduler con los SDKs oficiales de GCP. Un ejemplo es automatizar el lifecycle de snapshots y limpiar discos huérfanos para reducir costos de almacenamiento ocioso. También escribí scripts de remediación disparados por audit logs para compliance de seguridad.",
    "category": "Technical",
    "tags": [
      "python",
      "automation",
      "cloud functions",
      "sdk"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  // ─────────────────────────────────────────────
  // GCVE — honesto
  // ─────────────────────────────────────────────
  {
    "id": "globant_gcve_core",
    "question": "What is Google Cloud VMware Engine (GCVE) and when should it be used?",
    "enText": "GCVE gives you a dedicated VMware stack running on Google Cloud bare metal, and it's ideal for lift-and-shift migrations when you want to move out of a datacenter without refactoring applications. I've worked with VMware in my infrastructure roles and I understand GCVE as the natural path to bring those workloads into GCP.",
    "esText": "GCVE ofrece un stack dedicado de VMware sobre bare metal de Google Cloud, ideal para migraciones lift-and-shift cuando querés salir de un datacenter sin refactorizar aplicaciones. Trabajé con VMware en mis roles de infraestructura y entiendo GCVE como la ruta natural para llevar esas cargas a GCP.",
    "category": "Technical",
    "tags": [
      "gcve",
      "vmware",
      "gcp",
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
    "enText": "GCVE peers with the native GCP VPC using Private Services Access with Cloud Router for BGP. For on-premise connectivity you use Cloud Interconnect or VPN to reach the VMware NSX-T edge routers. I have hands-on experience configuring Cloud Interconnect and Cloud VPN in hybrid environments.",
    "esText": "GCVE se conecta a la VPC nativa con Private Services Access y Cloud Router para BGP. Para conectividad on-premise se usa Cloud Interconnect o VPN para llegar a los edge routers NSX-T de VMware. Tengo experiencia práctica configurando Cloud Interconnect y Cloud VPN en entornos híbridos.",
    "category": "Technical",
    "tags": [
      "gcve",
      "networking",
      "vpc",
      "interconnect",
      "nsx-t"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_vmware_migration",
    "question": "How do you execute virtual machine migrations from on-premise to GCVE or Compute Engine?",
    "enText": "For lift-and-shift to GCVE, VMware HCX with vMotion does zero-downtime bulk migrations across extended Layer 2 networks. For converting to native Compute Engine, Google Cloud Migrate handles background replication and test clones. My VMware and hybrid DR experience gives me a solid foundation for planning these migrations.",
    "esText": "Para lift-and-shift a GCVE, VMware HCX con vMotion hace migraciones masivas sin downtime sobre redes L2 extendidas. Para conversión a Compute Engine, Google Cloud Migrate maneja replicación en background y clones de test. Mi experiencia en VMware y DR híbrido me da una base sólida para planificar estas migraciones.",
    "category": "Technical",
    "tags": [
      "hcx",
      "vmware",
      "migration",
      "vmotion"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  // ─────────────────────────────────────────────
  // TECHNICAL — sin métricas duras
  // ─────────────────────────────────────────────
  {
    "id": "globant_terraform_structure",
    "question": "How do you structure infrastructure as code using Terraform?",
    "enText": "I separate Terraform into modular environments for networking, IAM, compute, and security with remote state in GCS. I use Cloud Build for CI-CD with automated plan generation on every pull request, so all changes are peer-reviewed. This approach made provisioning much faster and more reliable.",
    "esText": "Separo Terraform en módulos para networking, IAM, compute y security con state remoto en GCS. Uso Cloud Build para CI-CD con planes automáticos en cada pull request, para que todos los cambios sean revisados. Este enfoque hizo el aprovisionamiento mucho más rápido y confiable.",
    "category": "Technical",
    "tags": [
      "terraform",
      "iac",
      "modules",
      "ci/cd"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_vpc_design",
    "question": "How do you design an enterprise VPC architecture in GCP?",
    "enText": "I use Shared VPC where host projects centralize subnets, firewalls, and Cloud Routers, and service projects deploy isolated workloads. Cloud NAT handles outbound internet and Private Google Access lets instances reach GCP APIs without public IPs. This keeps network governance centralized while workloads stay separated.",
    "esText": "Uso Shared VPC donde los host projects centralizan subredes, firewalls y Cloud Routers, y los service projects despliegan workloads aislados. Cloud NAT maneja internet saliente y Private Google Access permite que las instancias accedan a APIs de GCP sin IPs públicas. Esto mantiene la gobernanza de red centralizada mientras los workloads quedan separados.",
    "category": "Technical",
    "tags": [
      "vpc",
      "shared vpc",
      "cloud nat",
      "networking"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_load_balancing",
    "question": "How does Google Cloud Load Balancing work?",
    "enText": "GCP external Application Load Balancers use a global anycast VIP to route traffic to the nearest Google POP, which reduces TLS handshake latency. Backend services use instance groups with health checks and Google-managed SSL certificates. I've used this for enterprise clients to ensure global traffic distribution and high availability.",
    "esText": "Los Application Load Balancers externos de GCP usan un VIP anycast global para enrutar tráfico al POP más cercano de Google, reduciendo latencia TLS. Los backend services usan instance groups con health checks y certificados SSL administrados por Google. Lo he usado en clientes enterprise para distribución global de tráfico y alta disponibilidad.",
    "category": "Technical",
    "tags": [
      "load balancer",
      "anycast",
      "ssl",
      "routing"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_cloud_armor",
    "question": "How do you protect enterprise GCP infrastructure from attacks?",
    "enText": "I deploy Cloud Armor at the external load balancer to filter layer seven attacks and block malicious IPs before they reach backend compute. I set up WAF rules for common attack patterns and adaptive rate limiting. At Reforest this was part of our defense-in-depth strategy for the Kubernetes ingress layer.",
    "esText": "Aplico Cloud Armor en el balanceador externo para filtrar ataques L7 y bloquear IPs maliciosas antes de que lleguen al compute. Configuro reglas WAF para patrones de ataque comunes y rate limiting adaptativo. En Reforest esto fue parte de nuestra estrategia de defensa en profundidad para la capa de ingress de Kubernetes.",
    "category": "Technical",
    "tags": [
      "cloud armor",
      "security",
      "waf",
      "ddos"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_gke_experience",
    "question": "What is your experience with Kubernetes and GKE?",
    "enText": "I work with both GKE Standard and Autopilot, managing multi-zone node pools, autoscaling, and workload identity federation. I write Helm charts and Kustomize overlays integrated with ArgoCD for GitOps deployments. At Reforest we moved workloads to Autopilot to reduce operational overhead and improve security.",
    "esText": "Trabajo con GKE Standard y Autopilot, administrando node pools multi-zona, autoscaling y workload identity federation. Escribo charts Helm y overlays Kustomize integrados con ArgoCD para despliegues GitOps. En Reforest migramos workloads a Autopilot para reducir overhead operativo y mejorar seguridad.",
    "category": "Technical",
    "tags": [
      "gke",
      "kubernetes",
      "helm",
      "argocd",
      "gitops"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_linux_troubleshooting",
    "question": "How do you troubleshoot a Linux instance with high latency in GCP?",
    "enText": "I start with serial console logs and check local sockets with ss, then look at iptables for firewall blocks. If that's clean, I review VPC Flow Logs in Cloud Logging to see if packets are being dropped by network policies. For performance issues I use vmstat, iostat, and htop to find the bottleneck.",
    "esText": "Arranco con logs de consola serie y reviso sockets locales con ss, luego miro iptables para bloqueos de firewall. Si está limpio, reviso VPC Flow Logs en Cloud Logging para ver si paquetes están siendo descartados por políticas de red. Para issues de performance uso vmstat, iostat y htop para encontrar el cuello de botella.",
    "category": "Technical",
    "tags": [
      "linux",
      "troubleshooting",
      "vpc flow logs",
      "latency"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_ha_dr",
    "question": "How do you architect disaster recovery in GCP?",
    "enText": "I design multi-region topologies based on RPO and RTO targets. For databases I use Cloud SQL with cross-region read replicas and automated failover, and for storage I use dual-region Cloud Storage. At UBA I maintained a large production database with high-availability replication and kept recovery times quite tight.",
    "esText": "Diseño topologías multi-región según los objetivos de RPO y RTO. Para bases de datos uso Cloud SQL con réplicas de lectura cross-region y failover automático, y para almacenamiento uso Cloud Storage dual-region. En UBA mantuve una base de datos de producción grande con réplica de alta disponibilidad y tiempos de recuperación bastante ajustados.",
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
    "question": "How do you enforce IAM security in GCP?",
    "enText": "I use predefined or custom IAM roles instead of broad Owner or Editor permissions. For CI-CD and third-party tools I replace long-lived service account keys with Workload Identity Federation using short-lived tokens. I also audit IAM bindings regularly to clean up stale permissions.",
    "esText": "Uso roles predefinidos o personalizados en lugar de permisos amplios de Owner o Editor. Para CI-CD y herramientas third-party reemplazo claves de service account de larga duración con Workload Identity Federation usando tokens temporales. También audito bindings de IAM periódicamente para limpiar permisos obsoletos.",
    "category": "Security",
    "tags": [
      "iam",
      "least privilege",
      "workload identity",
      "security"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_finops_costs",
    "question": "How do you optimize infrastructure costs in GCP?",
    "enText": "I review GCP Billing reports and Recommender insights to apply committed use discounts and right-size VMs. I also use storage lifecycle rules to move cold data to cheaper tiers. At Reforest automating non-production shutdowns and rightsizing made a big difference in the monthly bill.",
    "esText": "Reviso reportes de GCP Billing y Recommender para aplicar committed use discounts y redimensionar VMs. También uso lifecycle rules para mover datos fríos a tiers más baratos. En Reforest automatizar el apagado de entornos no productivos y redimensionar hizo una gran diferencia en la factura mensual.",
    "category": "Technical",
    "tags": [
      "finops",
      "costs",
      "billing",
      "right-sizing"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_monitoring_observability",
    "question": "How do you set up monitoring and alerting?",
    "enText": "I build dashboards tracking latency, traffic, errors, and saturation. I have hands-on experience with Instana for real-time performance monitoring and OpenTelemetry for distributed tracing. I also use Cloud Monitoring with Ops Agent and configure alerts to Slack for proactive incident response.",
    "esText": "Armo dashboards rastreando latencia, tráfico, errores y saturación. Tengo experiencia práctica con Instana para monitoreo en tiempo real y OpenTelemetry para tracing distribuido. También uso Cloud Monitoring con Ops Agent y configuro alertas a Slack para respuesta proactiva.",
    "category": "Technical",
    "tags": [
      "monitoring",
      "observability",
      "instana",
      "opentelemetry"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_databases_gcp",
    "question": "What database and compute options do you recommend for GCP?",
    "enText": "For relational workloads I use Cloud SQL with automated failover and point-in-time recovery. At UBA I managed large databases across PostgreSQL and SQL Server with high-availability replication. For analytics I combine BigQuery with Memorystore for Redis to reduce read pressure. For compute, GKE Autopilot for containers and Compute Engine for VM-based legacy apps.",
    "esText": "Para cargas relacionales uso Cloud SQL con failover automático y point-in-time recovery. En UBA administré bases de datos grandes en PostgreSQL y SQL Server con réplica de alta disponibilidad. Para analytics combino BigQuery con Memorystore para Redis. Para compute, GKE Autopilot para containers y Compute Engine para aplicaciones legacy en VMs.",
    "category": "Architecture",
    "tags": [
      "cloud sql",
      "database",
      "bigquery",
      "compute"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_linux_tools",
    "question": "Which Linux tools do you use for troubleshooting?",
    "enText": "I use ss for sockets, lsof for file handles and ports, and journalctl with dmesg for kernel and OOM events. For performance I combine vmstat, iostat, and htop to find CPU or disk bottlenecks. In GCP I also rely on serial console output for boot-level diagnostics.",
    "esText": "Uso ss para sockets, lsof para descriptores de archivo y puertos, y journalctl con dmesg para eventos de kernel y OOM. Para performance combino vmstat, iostat y htop para encontrar cuellos de botella de CPU o disco. En GCP también uso la consola serie para diagnósticos de boot.",
    "category": "Technical",
    "tags": [
      "linux tools",
      "ss",
      "lsof",
      "htop"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_cicd_pipelines",
    "question": "How do you implement CI-CD for cloud infrastructure?",
    "enText": "I build pipelines with GitHub Actions and Cloud Build that run terraform fmt, linting, and plan generation on every pull request. Merges to main trigger phased applies. I also use ArgoCD for GitOps Kubernetes deployments with automated rollbacks. This keeps all infrastructure changes reviewed and auditable.",
    "esText": "Armo pipelines con GitHub Actions y Cloud Build que ejecutan terraform fmt, linting y planes en cada pull request. Los merges a main activan applies escalonados. También uso ArgoCD para despliegues GitOps en Kubernetes con rollbacks automáticos. Esto mantiene todos los cambios de infraestructura revisados y auditados.",
    "category": "Technical",
    "tags": [
      "ci/cd",
      "github actions",
      "argocd",
      "gitops"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  // ─────────────────────────────────────────────
  // BEHAVIORAL / FIT
  // ─────────────────────────────────────────────
  {
    "id": "globant_agile_pods",
    "question": "How do you collaborate in agile teams?",
    "enText": "I like working in cross-functional pods where engineers own things end to end through two-week sprints. I value transparent communication with the client, blameless retrospectives, and clear documentation. That's how I've worked in my recent roles and it suits me well.",
    "esText": "Me gusta trabajar en pods multifuncionales donde los ingenieros tienen ownership end-to-end en sprints de dos semanas. Valoro la comunicación transparente con el cliente, retrospectivas sin culpa y documentación clara. Así es como he trabajado recientemente y me funciona bien.",
    "category": "Behavioral",
    "tags": [
      "agile pods",
      "sprints",
      "collaboration"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_why_join",
    "question": "Why are you interested in joining Globant and this Intermedia project?",
    "enText": "Globant is a global leader in digital transformation, and this project matches my hands-on experience in GCP, enterprise virtualization, and infrastructure automation. I'm motivated by hybrid challenges with GCVE and VMware, and by the chance to work end-to-end on infrastructure transformation with Terraform and Python.",
    "esText": "Globant es referente global en transformación digital, y este proyecto combina mi experiencia práctica en GCP, virtualización enterprise y automatización de infraestructura. Me motivan los desafíos híbridos con GCVE y VMware, y la oportunidad de trabajar end-to-end en transformación de infraestructura con Terraform y Python.",
    "category": "Screening",
    "tags": [
      "why globant",
      "intermedia",
      "motivation"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_salary_rate",
    "question": "What are your salary expectations?",
    "enText": "My target is between twenty-five and thirty dollars per hour, which aligns with my four-thousand-dollar monthly benchmark. I'm comfortable with the international contractor model and ready to start immediately.",
    "esText": "Mi referencia es entre 25 y 30 USD por hora, que equivale a unos 4,000 USD mensuales. Estoy cómodo con el modelo contractor internacional y listo para arrancar de inmediato.",
    "category": "Screening",
    "tags": [
      "salary",
      "rate",
      "hourly",
      "contractor"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_smalltalk_pets",
    "question": "Do you have any pets?",
    "enText": "Yes, I have a rescued dog named Luna. She was adopted from the street and is my daily remote work companion here in Salta. We go on walks to disconnect, and she brings great energy to my routine.",
    "esText": "Sí, tengo una perrita rescatada que se llama Luna. La adopté de la calle y es mi compañera diaria trabajando remoto en Salta. Salimos a caminar para desconectar y aporta una energía bárbara a mi rutina.",
    "category": "Screening",
    "tags": [
      "pets",
      "dog",
      "luna",
      "salta"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_smalltalk_hobbies",
    "question": "What do you do in your free time?",
    "enText": "I love cycling outdoors around the hills of Salta and spending time with my family and Luna. I also enjoy experimenting with my home-lab and new cloud tools on weekends.",
    "esText": "Me encanta salir a pedalear por las sierras de Salta y pasar tiempo con mi familia y Luna. También disfruto experimentar con mi home-lab y herramientas cloud nuevas los fines de semana.",
    "category": "Screening",
    "tags": [
      "hobbies",
      "free time",
      "cycling"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_incident_resolution",
    "question": "Tell me about a time you resolved a critical production incident.",
    "enText": "During a cloud migration we had intermittent packet drops on a hybrid interconnect tunnel that was threatening a deadline. I ran tcpdump traces and found mismatched jumbo frame configurations on the edge router. We fixed it and added automated MTU validation to the Terraform pipeline so it wouldn't happen again.",
    "esText": "Durante una migración cloud tuvimos caídas de paquetes intermitentes en un túnel híbrido que amenazaban un deadline. Hice trazas de tcpdump y encontré configuraciones de jumbo frames desalineadas en el router edge. Lo corregimos y agregamos validación automática de MTU al pipeline de Terraform para que no vuelva a pasar.",
    "category": "Behavioral",
    "tags": [
      "incident",
      "star",
      "troubleshooting"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_intermedia_vs_globant",
    "question": "Do you understand the difference between Intermedia and Globant?",
    "enText": "Yes. Intermedia is the hiring company, and Globant is the client where the infrastructure work happens. I would be engaged through Intermedia while working on the Globant project. This model is pretty common for specialized cloud roles.",
    "esText": "Sí. Intermedia es la empresa que contrata, y Globant es el cliente donde se ejecuta el trabajo de infraestructura. Estaría contratado a través de Intermedia mientras trabajo en el proyecto de Globant. Este modelo es bastante común en roles de cloud especializados.",
    "category": "Screening",
    "tags": [
      "intermedia",
      "globant",
      "hiring",
      "model"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_reverse_questions",
    "question": "Do you have any questions for us?",
    "enText": "Yes. Could you tell me more about the current stage of the project? Is the main focus on the initial GCVE migration or on long-term Terraform automation? Also, how is the team structured between Globant and Intermedia?",
    "esText": "Sí. ¿Podrías contarme en qué etapa está el proyecto? ¿El foco principal es la migración inicial con GCVE o la automatización a largo plazo con Terraform? ¿Y cómo se estructura el equipo entre Globant e Intermedia?",
    "category": "Screening",
    "tags": [
      "questions for them",
      "reverse questions",
      "cierre"
    ],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },

  // ─────────────────────────────────────────────
  // DUPLICATOS EN ESPAÑOL — por si la reclutadora
  // hace preguntas en español
  // ─────────────────────────────────────────────

  {
    "id": "globant_es_tell_me_about_yourself",
    "question": "Cuéntame sobre ti",
    "enText": "I'm Fernando, a Cloud and DevOps Engineer based in Salta, Argentina. I've been working in IT for over eight years in systems, backend, and infrastructure, and the last few years have been almost entirely on GCP, Terraform, Linux, and Kubernetes. Most recently at Reforest I led a small platform team, built GitOps pipelines, and helped significantly reduce the monthly cloud bill.",
    "esText": "Soy Fernando, ingeniero Cloud y DevOps en Salta. Llevo más de ocho años en IT en sistemas, backend e infraestructura, y los últimos años han sido casi enteramente en GCP, Terraform, Linux y Kubernetes. En Reforest lideré un equipo pequeño de plataforma, armé pipelines GitOps y ayudé a reducir bastante la factura de cloud.",
    "category": "Screening",
    "tags": ["cuéntame", "sobre ti", "presentación"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_experience_years",
    "question": "¿Cuántos años de experiencia tienes?",
    "enText": "I have over eight years total in IT across backend systems, databases, and infrastructure. The last three or four have been focused specifically on GCP, Terraform, and Linux. So my general IT background is broad, and the cloud part is where I've been going deep recently.",
    "esText": "Sumo más de ocho años totales en IT, en backend, bases de datos e infraestructura. Los últimos tres o fueron específicamente en GCP, Terraform y Linux. Mi base general es amplia, y el área de cloud es donde me he profundizado más recientemente.",
    "category": "Screening",
    "tags": ["años", "experiencia", "cuánto tiempo"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_english_level",
    "question": "¿Cómo es tu nivel de inglés?",
    "enText": "I'd say professional working level, around B2. I write documentation, read RFCs, and participate in agile ceremonies in English every day. In technical conversations I'm very comfortable.",
    "esText": "Diría que nivel profesional, alrededor de B2. Redacto documentación, leo RFCs y participo en ceremonias ágiles en inglés todos los días. En conversaciones técnicas me siento muy cómodo.",
    "category": "Screening",
    "tags": ["inglés", "nivel", "idioma"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_education",
    "question": "¿Cuál es tu formación académica?",
    "enText": "I'm currently advancing in Systems Engineering at UTN, expected around 2027. I also studied Labor Relations at UBA. My main certifications are Google Cloud Foundations, IBM AI Engineering, and Meta Backend Developer.",
    "esText": "Estoy avanzando en Ingeniería en Sistemas en la UTN, para más o menos 2027. También estudié Relaciones del Trabajo en la UBA. Mis certificaciones principales son Google Cloud Foundations, IBM AI Engineering y Meta Backend Developer.",
    "category": "Screening",
    "tags": ["formación", "estudios", "título", "educación"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_why_change",
    "question": "¿Por qué buscas cambio o estás abierto a nuevas oportunidades?",
    "enText": "I want to focus more on enterprise-scale GCP infrastructure, especially hybrid environments with GCVE and VMware. This project with Globant is exactly the kind of deep infrastructure work I want to do next.",
    "esText": "Quiero enfocarme más en infraestructura GCP enterprise, especialmente entornos híbridos con GCVE y VMware. Este proyecto con Globant es exactamente el tipo de infraestructura profunda que quiero hacer a continuación.",
    "category": "Screening",
    "tags": ["por qué", "cambio", "oportunidad", "motivación"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_availability",
    "question": "¿Cuándo podrías incorporarte o cuál es tu disponibilidad?",
    "enText": "I have immediate availability, or up to two weeks if a handover is needed. I'm flexible and ready to align on whatever date works best for the team.",
    "esText": "Tengo disponibilidad inmediata, o hasta dos semanas si hace falta una transición ordenada. Soy flexible y estoy listo para alinearme con la fecha que mejor funcione para el equipo.",
    "category": "Screening",
    "tags": ["disponibilidad", "cuándo", "incorporación"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_gcve_core",
    "question": "¿Qué es GCVE y cuándo se usa?",
    "enText": "GCVE gives you a dedicated VMware stack running on Google Cloud bare metal, and it's ideal for lift-and-shift migrations when you want to move out of a datacenter without refactoring applications.",
    "esText": "GCVE ofrece un stack dedicado de VMware sobre bare metal de Google Cloud, ideal para migraciones lift-and-shift cuando querés salir de un datacenter sin refactorizar aplicaciones.",
    "category": "Technical",
    "tags": ["gcve", "vmware", "gcp", "migración"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_terraform",
    "question": "¿Cómo estructuras la infraestructura como código con Terraform?",
    "enText": "I separate Terraform into modular environments for networking, IAM, compute, and security with remote state in GCS. I use Cloud Build for CI-CD with automated plan generation on every pull request.",
    "esText": "Separo Terraform en módulos para networking, IAM, compute y security con state remoto en GCS. Uso Cloud Build para CI-CD con planes automáticos en cada pull request.",
    "category": "Technical",
    "tags": ["terraform", "infraestructura", "código", "iac"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_salary",
    "question": "¿Cuáles son tus expectativas salariales?",
    "enText": "My target is between twenty-five and thirty dollars per hour, which aligns with my four-thousand-dollar monthly benchmark. I'm comfortable with the international contractor model.",
    "esText": "Mi referencia es entre 25 y 30 USD por hora, que equivale a unos 4,000 USD mensuales. Estoy cómodo con el modelo contractor internacional.",
    "category": "Screening",
    "tags": ["salario", "sueldo", "expectativas", "compensación"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_why_globant",
    "question": "¿Por qué te interesa Globant y este proyecto de Intermedia?",
    "enText": "Globant is a global leader in digital transformation, and this project matches my hands-on experience in GCP, enterprise virtualization, and infrastructure automation. I'm motivated by hybrid challenges with GCVE and VMware.",
    "esText": "Globant es referente global en transformación digital, y este proyecto combina mi experiencia práctica en GCP, virtualización enterprise y automatización de infraestructura. Me motivan los desafíos híbridos con GCVE y VMware.",
    "category": "Screening",
    "tags": ["por qué globant", "intermedia", "interés"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_reforest",
    "question": "Cuéntame sobre tu rol actual en Reforest",
    "enText": "I lead a small platform team working on cloud infrastructure and FinOps on GCP. We cut costs quite a bit through rightsizing and committed use discounts, and I built provisioning pipelines with Terraform that went from days to minutes.",
    "esText": "Lidero un equipo pequeño de plataforma trabajando en infraestructura cloud y FinOps en GCP. Redujimos los costos bastante con right-sizing y committed use discounts, y armé pipelines de aprovisionamiento con Terraform que pasaron de tardar días a minutos.",
    "category": "Screening",
    "tags": ["reforest", "rol actual", "plataforma"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_pets",
    "question": "¿Tenés mascotas?",
    "enText": "Yes, I have a rescued dog named Luna. She was adopted from the street and is my daily remote work companion here in Salta.",
    "esText": "Sí, tengo una perrita rescatada que se llama Luna. La adopté de la calle y es mi compañera diaria trabajando remoto en Salta.",
    "category": "Screening",
    "tags": ["mascotas", "perro", "luna"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_intermedia_vs_globant",
    "question": "¿Entendés la diferencia entre Intermedia y Globant?",
    "enText": "Yes. Intermedia is the hiring company, and Globant is the client where the infrastructure work happens. I would be engaged through Intermedia while working on the Globant project.",
    "esText": "Sí. Intermedia es la empresa que contrata, y Globant es el cliente donde se ejecuta el trabajo de infraestructura. Estaría contratado a través de Intermedia mientras trabajo en el proyecto de Globant.",
    "category": "Screening",
    "tags": ["intermedia", "globant", "contratación"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },

  // ─────────────────────────────────────────────
  // LOGÍSTICA — preguntas que la reclutadora suele hacer
  // ─────────────────────────────────────────────

  {
    "id": "globant_location_remote",
    "question": "Where are you located and are you open to remote work?",
    "enText": "I'm based in Salta, Argentina, which is UTC minus three. I'm fully set up for remote work and comfortable aligning with US or European schedules when needed. I've been working remotely for several years now.",
    "esText": "Estoy en Salta, Argentina, que es UTC menos tres. Estoy completamente equipado para trabajo remoto y cómodo alineándome con horarios de Estados Unidos o Europa cuando sea necesario. Llevo varios años trabajando remoto.",
    "category": "Screening",
    "tags": ["location", "remote", "timezone", "salta", "ubicación"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_consulting_model",
    "question": "How do you feel about working through a staffing company like Intermedia for a client like Globant?",
    "enText": "I'm comfortable with that model. I understand that Intermedia handles the employment relationship while I focus on delivering value on the Globant project. I've worked with multiple stakeholders before and I'm used to adapting to different team cultures.",
    "esText": "Estoy cómodo con ese modelo. Entiendo que Intermedia maneja la relación laboral mientras yo me enfoco en generar valor en el proyecto de Globant. He trabajado con múltiples stakeholders antes y estoy acostumbrado a adaptarme a diferentes culturas de equipo.",
    "category": "Screening",
    "tags": ["intermedia", "staffing", "consulting model", "modelo"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_why_intermedia",
    "question": "Why are you applying through Intermedia specifically?",
    "enText": "Intermedia came up as a good opportunity to work on a Globant project with strong GCP infrastructure requirements. The role matches my background in Terraform, Linux, and hybrid cloud environments, and I'm interested in the client's scale.",
    "esText": "Intermedia surgió como una buena oportunidad para trabajar en un proyecto de Globant con requisitos fuertes de infraestructura GCP. El rol combina con mi experiencia en Terraform, Linux e entornos cloud híbridos, y estoy interesado en la escala del cliente.",
    "category": "Screening",
    "tags": ["intermedia", "why", "por qué"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  // ─────────────────────────────────────────────
  // BEHAVIORAL / FIT — preguntas de comportamiento
  // ─────────────────────────────────────────────

  {
    "id": "globant_learn_new_thing",
    "question": "Tell me about a time you had to learn a new technology quickly.",
    "enText": "When I joined Reforest I had to pick up GKE Autopilot and ArgoCD for GitOps deployments. I learned by doing — set up a sandbox cluster, broke things, and iterated. Within a couple of weeks I was deploying production workloads with confidence.",
    "esText": "Cuando entré a Reforest tuve que aprender GKE Autopilot y ArgoCD para despliegues GitOps. Aprendí haciendo — armé un cluster sandbox, rompí cosas y fui iterando. En un par de semanas ya estaba desplegando workloads en producción con confianza.",
    "category": "Behavioral",
    "tags": ["learn", "new technology", "quickly", "adapt", "aprender"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_prioritize_urgent",
    "question": "How do you decide what to work on first when everything feels urgent?",
    "enText": "I focus on business impact first — which task unblocks the most people or reduces the most risk. I also communicate early if deadlines conflict, so stakeholders can make informed trade-offs. I've learned that being transparent about capacity is better than silently missing a deadline.",
    "esText": "Me enfoco en impacto de negocio primero — cuál tarea desbloquea más gente o reduce más riesgo. También comunico temprano si los deadlines chocan, para que los stakeholders tomen decisiones informadas. Aprendí que ser transparente sobre la capacidad es mejor que fallar un deadline en silencio.",
    "category": "Behavioral",
    "tags": ["prioritize", "urgent", "priority", "workload"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_disagreement_colleague",
    "question": "Describe a disagreement you had with a colleague about how to approach a problem.",
    "enText": "I once disagreed with a teammate about using a shared service account versus Workload Identity Federation for a CI-CD pipeline. I proposed a quick proof of concept to compare both approaches. The demo showed the security benefits clearly, and we ended up using Workload Identity. It was a good reminder that showing beats telling.",
    "esText": "Una vez discrepé con un compañero sobre usar una service account compartida versus Workload Identity Federation para un pipeline de CI-CD. Propuse una prueba rápida para comparar ambos enfoques. La demo mostró los beneficios de seguridad claramente, y terminamos usando Workload Identity. Fue un buen recordatorio de que demostrar es mejor que decir.",
    "category": "Behavioral",
    "tags": ["disagreement", "colleague", "conflict", "approach"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_proud_of",
    "question": "What is the work you are most proud of in cloud and DevOps?",
    "enText": "Building the GitOps pipeline at Reforest with ArgoCD and GKE Autopilot. It went from manual deployments to fully automated, with rollback capabilities and zero-downtime releases. Seeing the team ship faster and more safely was really satisfying.",
    "esText": "Armar el pipeline de GitOps en Reforest con ArgoCD y GKE Autopilot. Pasamos de despliegues manuales a completamente automatizados, con capacidad de rollback y releases sin downtime. Ver al equipo entregar más rápido y con más seguridad fue muy gratificante.",
    "category": "Behavioral",
    "tags": ["proud", "proudest", "achievement", "impact"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_explain_non_technical",
    "question": "How do you explain technical decisions to non-technical stakeholders?",
    "enText": "I try to frame things in terms of business outcomes — faster deployments, lower costs, fewer outages — rather than technical jargon. I use simple analogies and focus on what changed for the user or the business, not how the technology works under the hood.",
    "esText": "Intento enmarcar las cosas en términos de resultados de negocio — despliegues más rápidos, costos más bajos, menos caídas — en lugar de jerga técnica. Uso analogías simples y me enfoco en qué cambió para el usuario o el negocio, no en cómo funciona la tecnología por dentro.",
    "category": "Behavioral",
    "tags": ["explain", "non-technical", "communication", "stakeholder"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_first_90_days",
    "question": "Walk me through your ideal first 90 days in this role.",
    "enText": "In the first month I'd focus on learning the existing infrastructure, meeting the team, and understanding the current challenges. In the second month I'd start contributing to small tasks and take on something end-to-end. By the third month I'd have enough context to suggest improvements and ship a meaningful contribution.",
    "esText": "En el primer mes me enfocaría en aprender la infraestructura existente, conocer al equipo y entender los desafíos actuales. En el segundo mes empezaría a contribuir en tareas pequeñas y algo end-to-end. Para el tercer mes tendría contexto suficiente para sugerir mejoras y entregar una contribución significativa.",
    "category": "Behavioral",
    "tags": ["first 90 days", "onboarding", "plan", "primeros días"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_friday_incident",
    "question": "Something breaks in production on a Friday afternoon and you are the most senior person online. What do you do?",
    "enText": "I assess the severity first, then communicate immediately to stakeholders even if I don't have a fix yet. I contain the damage, start debugging systematically, and document what I find. After the incident I'd write up a post-mortem so the team learns from it.",
    "esText": "Primero evalúo la severidad, luego comunico inmediatamente a los stakeholders aunque no tenga solución aún. Contengo el daño, arranco el debug sistemático y documento lo que encuentro. Después del incidente haría un post-mortem para que el equipo aprenda.",
    "category": "Behavioral",
    "tags": ["incident", "friday", "production", "break", "emergency"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_unrealistic_deadline",
    "question": "Your team committed to a deadline that now looks unrealistic. How do you handle it?",
    "enText": "I flag it early rather than waiting until the day before. I figure out what can be cut or deferred, have an honest conversation with the stakeholder about trade-offs, and propose a revised plan. Working harder is not a strategy — communicating and re-scoping is.",
    "esText": "Lo señalo temprano en lugar de esperar hasta el día anterior. Veo qué se puede cortar o deferir, tengo una conversación honesta con el stakeholder sobre trade-offs y propongo un plan revisado. Trabajar más duro no es una estrategia — comunicar y re-escopar sí lo es.",
    "category": "Behavioral",
    "tags": ["deadline", "unrealistic", "commitment", "trade-off"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_weakness",
    "question": "What is your biggest weakness?",
    "enText": "I tend to go deep on technical solutions before checking if a simpler approach exists. I've gotten better at stepping back and asking myself whether the complexity is really needed, or if I'm just enjoying the puzzle. It's a balance between thoroughness and pragmatism.",
    "esText": "Suelo profundizar en soluciones técnicas antes de verificar si existe un enfoque más simple. He mejorado en dar un paso atrás y preguntarme si la complejidad es realmente necesaria, o si simplemente estoy disfrutando del desafío. Es un balance entre minuciosidad y pragmatismo.",
    "category": "Behavioral",
    "tags": ["weakness", "débil", "mejorar"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_stay_current",
    "question": "How do you stay current with emerging technologies?",
    "enText": "I follow GCP release notes, read architecture blog posts, and experiment with new services on personal projects. I also participate in cloud communities and do hands-on labs when new features come out. Practical experience sticks better than just reading about things.",
    "esText": "Sigo las release notes de GCP, leo posts de arquitectura y experimento con servicios nuevos en proyectos personales. También participo en comunidades cloud y hago labs prácticos cuando salen nuevas features. La experiencia práctica queda mejor que solo leer sobre las cosas.",
    "category": "Behavioral",
    "tags": ["stay current", "learning", "emerging", "technology", "tendencias"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_team_vs_solo",
    "question": "Do you prefer working independently or in a team?",
    "enText": "I'm comfortable with both. Remote work requires a lot of self-direction, which I enjoy. But I also value collaboration — code reviews, architecture discussions, and pair troubleshooting. The best results come from a team that trusts each other and communicates clearly.",
    "esText": "Me siento cómodo con ambos. El trabajo remoto requiere mucha autodirección, lo cual disfruto. Pero también valoro la colaboración — code reviews, discusiones de arquitectura y troubleshooting en pareja. Los mejores resultados vienen de un equipo que se confía y se comunica bien.",
    "category": "Behavioral",
    "tags": ["team", "independent", "solo", "collaboration", "equipo"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },

  // ─────────────────────────────────────────────
  // TECHNICAL — Docker, Ansible, Bash, más GCP
  // ─────────────────────────────────────────────

  {
    "id": "globant_docker_containers",
    "question": "What is your experience with Docker and containerization?",
    "enText": "I build Docker images with multi-stage builds to keep them small and secure. I manage container registries on GCR and Artifact Registry, and I handle container orchestration through GKE. At Reforest we containerized most workloads and moved them to Autopilot for easier management.",
    "esText": "Armo imágenes Docker con multi-stage builds para mantenerlas pequeñas y seguras. Administro container registries en GCR y Artifact Registry, y manejo orquestación de containers a través de GKE. En Reforest containerizamos la mayoría de los workloads y los movimos a Autopilot para facilitar la gestión.",
    "category": "Technical",
    "tags": ["docker", "containers", "multi-stage", "registry"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_ansible",
    "question": "Do you have experience with Ansible or configuration management?",
    "enText": "Yes, I've used Ansible for configuration management, particularly for bootstrapping servers and applying consistent hardening across fleets. I write playbooks with roles for reusability. In cloud contexts I prefer Terraform for provisioning and Ansible for post-provisioning configuration when needed.",
    "esText": "Sí, usé Ansible para gestión de configuración, especialmente para preparar servidores y aplicar hardening consistente en flotas. Escribo playbooks con roles para reutilización. En contextos cloud prefiero Terraform para aprovisionamiento y Ansible para configuración post-provisionamiento cuando es necesario.",
    "category": "Technical",
    "tags": ["ansible", "configuration management", "playbook", "hardening"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_bash_scripting",
    "question": "How do you use Bash scripting for infrastructure automation?",
    "enText": "I write Bash scripts for cron jobs, log rotation, backup automation, and one-time migrations. I also use them for health check endpoints and startup scripts on Compute Engine instances. Bash is quick and practical for tasks that don't need a full programming language.",
    "esText": "Escribo scripts de Bash para cron jobs, rotación de logs, automatización de backups y migraciones puntuales. También los uso para health check endpoints y scripts de inicio en instancias de Compute Engine. Bash es rápido y práctico para tareas que no necesitan un lenguaje completo.",
    "category": "Technical",
    "tags": ["bash", "scripting", "cron", "automation"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_cloud_run",
    "question": "When would you use Cloud Run versus GKE or Compute Engine?",
    "enText": "Cloud Run is great for stateless HTTP workloads or event-driven tasks where you don't want to manage clusters. GKE is better when you need Kubernetes APIs, sidecars, or complex networking. Compute Engine is for legacy apps that need full OS control. I pick based on operational overhead and workload requirements.",
    "esText": "Cloud Run es ideal para workloads HTTP sin estado o tareas event-driven donde no querés gestionar clusters. GKE es mejor cuando necesitás APIs de Kubernetes, sidecars o networking complejo. Compute Engine es para apps legacy que necesitan control total del OS. Elijo según overhead operativo y requisitos del workload.",
    "category": "Technical",
    "tags": ["cloud run", "gke", "compute engine", "when to use"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_pubsub",
    "question": "How have you used Pub/Sub in your projects?",
    "enText": "I've used Pub/Sub for decoupling services and handling asynchronous workloads. It's useful for event-driven architectures where you need reliable message delivery. I've integrated it with Cloud Functions and Dataflow for processing pipelines. The key advantage is that it handles backpressure automatically.",
    "esText": "Usé Pub/Sub para desacoplar servicios y manejar workloads asíncronos. Es útil para arquitecturas event-driven donde necesitás entrega confiable de mensajes. Lo integré con Cloud Functions y Dataflow para pipelines de procesamiento. La ventaja clave es que maneja backpressure automáticamente.",
    "category": "Technical",
    "tags": ["pubsub", "messaging", "event-driven", "async"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_cloud_storage",
    "question": "How do you manage Cloud Storage for enterprise workloads?",
    "enText": "I use dual-region or multi-region buckets for HA, lifecycle rules to transition data to cheaper storage classes, and uniform bucket-level IAM for access control. For sensitive data I enable CMEK encryption. I also set up Cloud Storage FUSE for mounting buckets as local filesystems when needed.",
    "esText": "Uso buckets dual-region o multi-region para HA, lifecycle rules para transicionar datos a clases de almacenamiento más baratas, y IAM a nivel de bucket para control de acceso. Para datos sensibles habilito CMEK. También configuro Cloud Storage FUSE para montar buckets como filesystem local cuando es necesario.",
    "category": "Technical",
    "tags": ["cloud storage", "bucket", "lifecycle", "iam"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_terraform_state",
    "question": "How do you manage Terraform state in a team environment?",
    "enText": "I store state in GCS buckets with versioning and encryption enabled. I use workspaces or separate state files per environment to isolate changes. I also enable state locking with Cloud Storage to prevent concurrent applies. For sensitive values I use environment variables instead of putting secrets in state.",
    "esText": "Guardo state en buckets de GCS con versioning y encryption habilitados. Uso workspaces o archivos de state separados por entorno para aislar cambios. También habilito state locking con Cloud Storage para prevenir applies concurrentes. Para valores sensibles uso variables de entorno en vez de poner secrets en el state.",
    "category": "Technical",
    "tags": ["terraform", "state", "gcs", "locking"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_networking_deep",
    "question": "How would you troubleshoot connectivity between two VPCs that should be peered?",
    "enText": "First I check if the VPC peering is active on both sides and if the CIDR ranges don't overlap. Then I verify firewall rules allow the traffic, check route tables, and use VPC Flow Logs to see if packets are being dropped. I also verify DNS resolution if services are communicating by hostname.",
    "esText": "Primero verifico si el VPC peering está activo en ambos lados y si los rangos CIDR no se superponen. Luego reviso si las reglas de firewall permiten el tráfico, verifico las tablas de ruteo y uso VPC Flow Logs para ver si paquetes están siendo descartados. También verifico resolución DNS si los servicios se comunican por hostname.",
    "category": "Technical",
    "tags": ["networking", "vpc peering", "troubleshooting", "flow logs"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_terraform_plan_apply",
    "question": "What is your approach to validating infrastructure changes before applying them?",
    "enText": "I always run terraform plan first and review every resource change. For larger changes I use a staging environment that mirrors production. I also run tflint and checkov for linting and security scanning. In CI-CD pipelines the plan is generated on every PR so the team can review before merge.",
    "esText": "Siempre ejecuto terraform plan primero y reviso cada cambio de recurso. Para cambios más grandes uso un entorno staging que refleja producción. También ejecuto tflint y checkov para linting y security scanning. En pipelines de CI-CD el plan se genera en cada PR para que el equipo revise antes del merge.",
    "category": "Technical",
    "tags": ["terraform", "plan", "validate", "staging", "linting"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_backup_dr_strategy",
    "question": "How do you approach backup and disaster recovery in GCP?",
    "enText": "I design DR based on RPO and RTO targets. For databases I use Cloud SQL automated backups with point-in-time recovery and cross-region replicas. For storage I use dual-region buckets with Object Versioning. I also test restores regularly to make sure backups actually work when needed.",
    "esText": "Diseño DR según objetivos de RPO y RTO. Para bases de datos uso backups automáticos de Cloud SQL con point-in-time recovery y réplicas cross-region. Para almacenamiento uso buckets dual-region con Object Versioning. También pruebo restores regularmente para asegurar que los backups funcionen cuando se necesiten.",
    "category": "Architecture",
    "tags": ["backup", "dr", "disaster recovery", "rpo", "rto"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_security_incident",
    "question": "How do you handle a security incident in a cloud environment?",
    "enText": "First I contain it — isolate affected resources, revoke compromised credentials, and block malicious IPs. Then I investigate using Cloud Audit Logs and VPC Flow Logs to understand the blast radius. After containment I do a root cause analysis and implement preventive controls so it doesn't happen again.",
    "esText": "Primero lo contengo — aíslo recursos afectados, revoco credenciales comprometidas y bloqueo IPs maliciosas. Luego investigo con Cloud Audit Logs y VPC Flow Logs para entender el radio de impacto. Después del containment hago un root cause analysis e implemento controles preventivos para que no vuelva a pasar.",
    "category": "Security",
    "tags": ["security", "incident", "containment", "audit logs"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_cloud_migration_strategy",
    "question": "How do you approach a cloud migration for an enterprise client?",
    "enText": "I start with discovery and assessment — cataloging workloads, dependencies, and compliance requirements. Then I classify each workload as rehost, replatform, or refactor. I build a landing zone with networking, IAM, and security baselines, and migrate in phases starting with low-risk workloads to build confidence.",
    "esText": "Arranco con discovery y assessment — inventariando workloads, dependencias y requisitos de compliance. Luego clasifico cada workload como rehost, replatform o refactor. Armo un landing zone con networking, IAM y baselines de seguridad, y migro en fases empezando con workloads de bajo riesgo para generar confianza.",
    "category": "Architecture",
    "tags": ["migration", "cloud migration", "landing zone", "rehost"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_terraform_modules",
    "question": "How do you create reusable Terraform modules?",
    "enText": "I design modules with clear inputs and outputs, use variables for customization, and publish them in a private registry. Each module has a README with usage examples and a README with a README. I version modules with semantic versioning so teams can pin to stable versions.",
    "esText": "Diseño módulos con inputs y outputs claros, uso variables para personalización y los publico en un registry privado. Cada módulo tiene un README con ejemplos de uso. Versiono módulos con semantic versioning para que los equipos puedan fijar versiones estables.",
    "category": "Technical",
    "tags": ["terraform", "modules", "reusable", "registry"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_gke_security",
    "question": "How do you secure a GKE cluster?",
    "enText": "I enable Workload Identity for pod-level IAM, use Binary Authorization for image signing, and enable Shielded GKE Nodes. I also apply network policies to restrict pod-to-pod communication and use private clusters with authorized networks. Regular node upgrades and image scanning are part of the routine.",
    "esText": "Habilito Workload Identity para IAM a nivel de pod, uso Binary Authorization para image signing y habilito Shielded GKE Nodes. También aplico network policies para restringir comunicación pod-to-pod y uso clusters privados con redes autorizadas. Upgrades regulares de nodos y escaneo de imágenes son parte de la rutina.",
    "category": "Security",
    "tags": ["gke", "security", "workload identity", "binary auth"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_logging_troubleshoot",
    "question": "How do you troubleshoot a service that is returning 502 errors?",
    "enText": "I check Cloud Load Balancer logs first to see if the backend is healthy. Then I look at application logs in Cloud Logging for exceptions or timeouts. I verify the health check configuration and firewall rules. If it's a GKE service, I check pod readiness, service endpoints, and ingress configuration.",
    "esText": "Primero reviso logs del Cloud Load Balancer para ver si el backend está healthy. Luego miro application logs en Cloud Logging para excepciones o timeouts. Verifico la configuración de health check y reglas de firewall. Si es un servicio GKE, reviso readiness de pods, service endpoints y configuración de ingress.",
    "category": "Technical",
    "tags": ["troubleshooting", "502", "load balancer", "logging"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  // ─────────────────────────────────────────────
  // BEHAVIORAL — más situacionales
  // ─────────────────────────────────────────────

  {
    "id": "globant_feedback",
    "question": "Tell me about a time you received constructive feedback. How did you handle it?",
    "enText": "A teammate once pointed out that my Terraform modules were too tightly coupled, making them hard to reuse. I took it well, refactored the modules with clearer interfaces, and the team started reusing them across projects. Good feedback makes the work better.",
    "esText": "Un compañero me señaló que mis módulos de Terraform estaban muy acoplados, difíciles de reutilizar. Lo tomé bien, refactoricé los módulos con interfaces más claros y el equipo empezó a reutilizarlos en varios proyectos. El buen feedback mejora el trabajo.",
    "category": "Behavioral",
    "tags": ["feedback", "constructive", "improve", "mejora"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_adapt_change",
    "question": "Tell me about a time you had to adapt to a significant change at work.",
    "enText": "When Reforest shifted from standard GKE to Autopilot, I had to rethink our entire deployment pipeline. I learned the new model quickly, adapted our Helm charts and ArgoCD configs, and trained the team. The transition went smoothly because I focused on understanding the why behind the change.",
    "esText": "Cuando Reforest cambió de GKE estándar a Autopilot, tuve que repensar todo nuestro pipeline de despliegue. Aprendí el modelo nuevo rápidamente, adapté nuestros charts Helm y configuraciones de ArgoCD, y capacité al equipo. La transición salió bien porque me enfocé en entender el por qué del cambio.",
    "category": "Behavioral",
    "tags": ["adapt", "change", "flexibility", "cambio"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_mentoring",
    "question": "Have you mentored or helped a junior team member grow?",
    "enText": "Yes, at Reforest I helped a junior developer learn Terraform and GKE. I paired with them on real tasks, did code reviews with detailed explanations, and created runbooks for common operations. Seeing them become independent was one of the most rewarding parts of the role.",
    "esText": "Sí, en Reforest ayudé a un desarrollador junior a aprender Terraform y GKE. Hice pairing en tareas reales, code reviews con explicaciones detalladas y creé runbooks para operaciones comunes. Verlo volverse independiente fue una de las partes más gratificantes del rol.",
    "category": "Behavioral",
    "tags": ["mentoring", "junior", "teach", "grow"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_quality_vs_speed",
    "question": "How do you balance quality with speed when delivering under pressure?",
    "enText": "I focus on what can be cut safely versus what must be solid. For infrastructure I never skip plan review and testing, but I might simplify documentation or defer non-critical optimizations. The key is being transparent about trade-offs so the team makes informed decisions together.",
    "esText": "Me enfoco en qué se puede cortar de forma segura versus qué debe ser sólido. Para infraestructura nunca salto la revisión de plan ni los tests, pero puedo simplificar documentación o deferir optimizaciones no críticas. La clave es ser transparente sobre los trade-offs para que el equipo tome decisiones informadas juntos.",
    "category": "Behavioral",
    "tags": ["quality", "speed", "trade-off", "pressure"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_failure_lesson",
    "question": "Tell me about a project that didn't go as planned. What did you learn?",
    "enText": "I once underestimated the complexity of migrating a legacy Windows workload to GCP. I planned for two weeks but it took four because of undocumented dependencies. I learned to do deeper discovery upfront and build buffer time into migration plans. Now I always ask what could go wrong before committing to a timeline.",
    "esText": "Una vez subestimé la complejidad de migrar un workload legacy de Windows a GCP. Planifiqué dos semanas pero tomó cuatro por dependencias no documentadas. Aprendí a hacer un discovery más profundo al inicio y construir buffer en los planes de migración. Ahora siempre pregunto qué puede salir mal antes de comprometerme con un timeline.",
    "category": "Behavioral",
    "tags": ["failure", "lesson", "mistake", "learn"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_multiple_projects",
    "question": "How do you manage working on multiple projects or clients at the same time?",
    "enText": "I keep separate task lists and context for each project, and I block dedicated time for deep work on each one. I communicate proactively with stakeholders about progress and blockers. Having a clear priority system helps me switch contexts without losing track of details.",
    "esText": "Mantengo listas de tareas y contexto separados para cada proyecto, y bloqueo tiempo dedicado para trabajo profundo en cada uno. Comunico progresivamente con stakeholders sobre avances y bloqueos. Tener un sistema de prioridades claro me ayuda a cambiar de contexto sin perder detalles.",
    "category": "Behavioral",
    "tags": ["multiple projects", "multitask", "context switching"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_async_remote",
    "question": "How do you handle working with teams in different timezones?",
    "enText": "I write clear documentation and leave detailed handoff notes so async collaboration works well. I overlap with the team during core hours and use tools like Slack and Loom for status updates. I've learned that over-communicating is better than under-communicating when working remotely.",
    "esText": "Escribo documentación clara y dejo notas de handoff detalladas para que la colaboración asíncrona funcione bien. Me superpongo con el equipo en horas core y uso herramientas como Slack y Loom para actualizaciones de estado. Aprendí que sobre-comunicar es mejor que infra-comunicar cuando se trabaja remoto.",
    "category": "Behavioral",
    "tags": ["timezone", "remote", "async", "communication"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_first_month",
    "question": "What would you focus on in your first month here?",
    "enText": "I'd spend the first two weeks learning the existing infrastructure, understanding the current pain points, and building relationships with the team. By week three I'd start contributing to small tasks, and by week four I'd have enough context to suggest one concrete improvement based on what I've observed.",
    "esText": "Pasaría las primeras dos semanas aprendiendo la infraestructura existente, entendiendo los puntos de dolor actuales y construyendo relaciones con el equipo. Para la semana tres empezaría a contribuir en tareas pequeñas, y para la semana cuatro tendría contexto suficiente para sugerir una mejora concreta basada en lo que observé.",
    "category": "Behavioral",
    "tags": ["first month", "onboarding", "plan"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_boring_task",
    "question": "How do you stay motivated on repetitive or less exciting tasks?",
    "enText": "I remind myself that reliable infrastructure is built on boring, well-executed tasks. I try to automate what I can so the repetition goes away, and I focus on doing it right the first time to avoid rework. Even mundane work teaches you patterns that apply to bigger challenges.",
    "esText": "Recuerdo que la infraestructura confiable se construye sobre tareas aburridas bien ejecutadas. Intento automatizar lo que puedo para que la repetición desaparezca, y me enfoco en hacerlo bien la primera vez para evitar retrabajo. Incluso el trabajo mundano enseña patrones que aplican a desafíos más grandes.",
    "category": "Behavioral",
    "tags": ["motivation", "boring", "repetitive", "automate"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_stakeholder_pushback",
    "question": "Tell me about a time you had to push back on a stakeholder's technical approach.",
    "enText": "A client wanted to put production databases on preemptible VMs to save costs. I explained the risk of data loss and downtime, and proposed committed use discounts on regular instances instead. The cost difference was minimal and the reliability was much better. Sometimes the cheapest option isn't the best one.",
    "esText": "Un cliente quería poner bases de datos de producción en VMs preemptibles para ahorrar costos. Expliqué el riesgo de pérdida de datos y downtime, y propuse committed use discounts en instancias regulares en su lugar. La diferencia de costo era mínima y la confiabilidad mucho mejor. A veces la opción más barata no es la mejor.",
    "category": "Behavioral",
    "tags": ["pushback", "stakeholder", "trade-off", "cost"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_production_outage",
    "question": "Tell me about a time you resolved a major production outage.",
    "enText": "We had a database failover that left the application with no connection pool. I checked Cloud SQL status, verified the replica was promoted, then restarted the application pods to clear stale connections. The service recovered in minutes. After that I implemented connection pooling and health check improvements to prevent recurrence.",
    "esText": "Tuvimos un failover de base de datos que dejó la aplicación sin pool de conexiones. Revisé el estado de Cloud SQL, verifiqué que la réplica fue promovida, y reinicié los pods de la aplicación para limpiar conexiones obsoletas. El servicio se recuperó en minutos. Después implementé connection pooling y mejoras de health check para prevenir recurrencia.",
    "category": "Behavioral",
    "tags": ["outage", "production", "database", "failover"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_international_client",
    "question": "Do you have experience working with international or English-speaking clients?",
    "enText": "Yes, in my consulting role I worked with international clients on infrastructure projects. I wrote documentation in English, participated in technical calls, and collaborated with distributed teams. I'm comfortable with English as the working language for technical communication.",
    "esText": "Sí, en mi rol de consultoría trabajé con clientes internacionales en proyectos de infraestructura. Redacté documentación en inglés, participé en llamadas técnicas y colaboré con equipos distribuidos. Estoy cómodo con el inglés como idioma de trabajo para comunicación técnica.",
    "category": "Screening",
    "tags": ["international", "client", "english", "global"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_automation_examples",
    "question": "What kinds of infrastructure automation have you built?",
    "enText": "I've automated VM provisioning with Terraform, snapshot lifecycle management with Cloud Functions, security remediation with Cloud Scheduler, and deployment pipelines with Cloud Build and ArgoCD. The goal is always to eliminate manual steps that are error-prone and slow.",
    "esText": "Automatizé aprovisionamiento de VMs con Terraform, gestión de lifecycle de snapshots con Cloud Functions, remediación de seguridad con Cloud Scheduler, y pipelines de despliegue con Cloud Build y ArgoCD. El objetivo siempre es eliminar pasos manuales que son propensos a errores y lentos.",
    "category": "Technical",
    "tags": ["automation", "terraform", "cloud functions", "cloud build"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },

  // ─────────────────────────────────────────────
  // PERSONALES / LIFESTYLE — preguntas que sueltan
  // la reclutadora para conocerte
  // ─────────────────────────────────────────────

  {
    "id": "globant_where_see_5_years",
    "question": "Where do you see yourself in five years?",
    "enText": "I see myself as a senior cloud architect or infrastructure lead, working on complex hybrid environments. I want to keep growing technically while also contributing to team leadership. Five years from now I'd like to be a trusted advisor for clients on GCP and GCVE strategy.",
    "esText": "Me veo como un arquitecto cloud senior o líder de infraestructura, trabajando en entornos híbridos complejos. Quiero seguir creciendo técnicamente mientras también contribuyo a liderazgo de equipo. En cinco años me gustaría ser un advisor confiable para clientes en estrategia de GCP y GCVE.",
    "category": "Screening",
    "tags": ["five years", "future", "career", "futuro"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_why_should_hire",
    "question": "Why should we hire you over other candidates?",
    "enText": "I bring hands-on GCP production experience combined with strong Linux and networking fundamentals. I've built real infrastructure from scratch — Terraform pipelines, GKE clusters, hybrid DR — not just configured existing setups. I'm also a fast learner who gets things done independently.",
    "esText": "Traigo experiencia práctica en GCP producción combinada con fundamentos sólidos de Linux y networking. He construido infraestructura real desde cero — pipelines de Terraform, clusters GKE, DR híbrido — no solo configuré setups existentes. También soy rápido aprendiendo y soy independiente para hacer las cosas.",
    "category": "Screening",
    "tags": ["why hire", "differentiator", "value", "por qué vos"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_how_handle_stress",
    "question": "How do you handle stress or high-pressure situations?",
    "enText": "I stay calm and focus on what I can control. I break the problem into smaller pieces, communicate early about blockers, and ask for help when needed. Pressure doesn't bother me — I've been on-call and handled production incidents many times. The key is staying methodical.",
    "esText": "Me mantengo calmado y me enfoco en lo que puedo controlar. Divido el problema en partes más pequeñas, comunico temprano sobre bloqueos y pido ayuda cuando la necesito. La presión no me molesta — estuve de guardia y manejé incidents de producción muchas veces. La clave es ser metódico.",
    "category": "Behavioral",
    "tags": ["stress", "pressure", "calm", "ansiedad"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_motivation",
    "question": "What motivates you or what are you passionate about?",
    "enText": "I'm motivated by solving real problems with technology — seeing something that used to take hours happen automatically in seconds. I also enjoy the learning curve in cloud because the technology keeps evolving. Building reliable infrastructure that other people depend on gives me a lot of satisfaction.",
    "esText": "Me motiva resolver problemas reales con tecnología — ver algo que tomaba horas ocurrir automáticamente en segundos. También disfruto la curva de aprendizaje en cloud porque la tecnología sigue evolucionando. Construir infraestructura confiable de la que otros dependen me da mucha satisfacción.",
    "category": "Behavioral",
    "tags": ["motivation", "passion", "what drives you"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_disagree_with_manager",
    "question": "Tell me about a time you disagreed with a manager or team lead.",
    "enText": "I once disagreed with a team lead about skipping the plan review step in Terraform to save time. I explained the risk of unreviewed infrastructure changes and proposed a lighter review process instead. We found a middle ground — faster reviews but still mandatory. The team avoided a potential misconfiguration.",
    "esText": "Una vez discrepé con un team lead sobre saltar el paso de revisión de plan en Terraform para ahorrar tiempo. Expliqué el riesgo de cambios de infraestructura sin revisar y propuse un proceso de review más ligero. Encontramos un punto medio — reviews más rápidos pero aún obligatorios. El equipo evitó una possible mala configuración.",
    "category": "Behavioral",
    "tags": ["disagree", "manager", "lead", "conflict"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_go_above_beyond",
    "question": "Tell me about a time you went above and beyond what was expected.",
    "enText": "At Reforest I noticed we were paying for idle resources across dev environments. Nobody asked me to fix it, but I audited the billing, built a shutdown automation, and presented the savings to leadership. It became a standard practice and reduced our cloud bill significantly.",
    "esText": "En Reforest noté que estábamos pagando por recursos ociosos en entornos de dev. Nadie me pidió arreglarlo, pero audité la facturación, armé una automatización de apagado y presenté los ahorros a leadership. Se convirtió en una práctica estándar y redujo nuestra factura de cloud considerablemente.",
    "category": "Behavioral",
    "tags": ["above and beyond", "initiative", "proactive"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_delegating",
    "question": "How do you delegate tasks or work with others to get things done?",
    "enText": "I match tasks to people's strengths and give clear context on what needs to be done and why. I set check-in points instead of micromanaging. For infrastructure work I pair with less experienced teammates on complex tasks so they learn while contributing.",
    "esText": "Asigno tareas según las fortalezas de cada persona y doy contexto claro sobre qué hacer y por qué. Puntos de check-in en vez de micromanagear. Para trabajo de infraestructura hago pairing con teammates menos experimentados en tareas complejas para que aprendan mientras contribuyen.",
    "category": "Behavioral",
    "tags": ["delegating", "teamwork", "leadership"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_criticism",
    "question": "How do you handle criticism of your work?",
    "enText": "I take it as an opportunity to improve. If someone points out a flaw in my infrastructure design, I want to hear it before it causes an issue in production. I've learned that the best engineers are the ones who can accept feedback gracefully and act on it.",
    "esText": "Lo tomo como una oportunidad para mejorar. Si alguien señala un fallo en mi diseño de infraestructura, quiero escucharlo antes de que cause un problema en producción. Aprendí que los mejores ingenieros son los que pueden recibir feedback con gracia y actuar en consecuencia.",
    "category": "Behavioral",
    "tags": ["criticism", "feedback", "accept"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_difficult_decision",
    "question": "Tell me about a time you had to make a difficult decision with limited information.",
    "enText": "During a production incident I had to choose between rolling back a deployment immediately or spending more time investigating the root cause. I chose to roll back first to restore service, then investigated calmly. The right call was to prioritize user impact over perfect diagnosis.",
    "esText": "Durante un incidente de producción tuve que elegir entre hacer rollback de un despliegue inmediatamente o gastar más tiempo investigando la causa raíz. Elegí hacer rollback primero para restaurar servicio, luego investigué calmadamente. La decisión correcta fue priorizar el impacto al usuario sobre el diagnóstico perfecto.",
    "category": "Behavioral",
    "tags": ["difficult decision", "limited information", "judgment"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_know_about_globant",
    "question": "What do you know about Globant?",
    "enText": "Globant is a global technology company known for digital transformation, with over twenty thousand employees across multiple countries. They work with major clients in media, finance, and technology. I'm particularly interested in their cloud and infrastructure practice and the scale of projects they handle.",
    "esText": "Globant es una empresa tecnológica global conocida por transformación digital, con más de veinte mil empleados en múltiples países. Trabajan con clientes importantes en medios, finanzas y tecnología. Estoy particularmente interesado en su práctica de cloud e infraestructura y la escala de proyectos que manejan.",
    "category": "Screening",
    "tags": ["globant", "company", "what do you know"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_know_about_intermedia",
    "question": "What do you know about Intermedia?",
    "enText": "Intermedia is a staffing and consulting company that connects specialized talent with enterprise clients like Globant. They handle the employment relationship while the consultant works on the client's project. This model is common for specialized cloud and infrastructure roles.",
    "esText": "Intermedia es una empresa de staffing y consultoría que conecta talento especializado con clientes enterprise como Globant. Manejan la relación laboral mientras el consultor trabaja en el proyecto del cliente. Este modelo es común en roles especializados de cloud e infraestructura.",
    "category": "Screening",
    "tags": ["intermedia", "company", "what do you know"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_references",
    "question": "Can you provide professional references?",
    "enText": "Yes, I can provide references from previous managers and colleagues. I'll reach out to them so they're prepared if contacted. I've maintained good relationships with my previous teams and I'm confident they'll speak positively about my work.",
    "esText": "Sí, puedo dar referencias de managers y compañeros anteriores. Voy a contactarlos para que estén preparados si los comunican. Mantuve buenas relaciones con mis equipos anteriores y estoy seguro de que hablarán bien de mi trabajo.",
    "category": "Screening",
    "tags": ["references", "contact", "referencias"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_notice_period",
    "question": "What is your notice period or when can you start?",
    "enText": "I can start immediately or with up to two weeks notice if needed for a handover. I'm flexible and want to make the transition smooth for both sides.",
    "esText": "Puedo empezar inmediatamente o con hasta dos semanas de preaviso si se necesita para una transición. Soy flexible y quiero que la transición sea fluida para ambos lados.",
    "category": "Screening",
    "tags": ["notice period", "start", "when", "disponibilidad"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_willing_travel",
    "question": "Are you willing to travel or work from the client's office if needed?",
    "enText": "I'm based in Salta and primarily work remotely, but I'm open to occasional travel if the project requires it. I have a good home office setup with stable internet for remote work.",
    "esText": "Estoy en Salta y trabajo principalmente remoto, pero estoy abierto a viajes ocasionales si el proyecto lo requiere. Tengo un buen setup de oficina en casa con internet estable para trabajo remoto.",
    "category": "Screening",
    "tags": ["travel", "office", "remote", "viaje"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_home_office",
    "question": "Do you have a proper home office setup for remote work?",
    "enText": "Yes, I have a dedicated workspace with a good monitor, reliable internet, and backup connectivity. I've been working remotely for years and I'm set up for productive remote work.",
    "esText": "Sí, tengo un workspace dedicado con buen monitor, internet confiable y conectividad de backup. Llevo años trabajando remoto y estoy equipado para ser productivo desde casa.",
    "category": "Screening",
    "tags": ["home office", "setup", "remote", "equipo"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_work_hours",
    "question": "What hours can you work? Are you flexible with schedules?",
    "enText": "I'm flexible with my schedule. I can align with US or European business hours when needed. I usually work a standard day but I'm happy to adjust for meetings or critical deployments across timezones.",
    "esText": "Soy flexible con mi horario. Puedo alinearme con horarios laborales de Estados Unidos o Europa cuando sea necesario. Trabajo un día estándar pero estoy feliz de ajustar para reuniones o despliegues críticos en distintos husos horarios.",
    "category": "Screening",
    "tags": ["hours", "schedule", "flexible", "horario"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_other_offers",
    "question": "Do you have other offers or are you interviewing elsewhere?",
    "enText": "I'm actively looking and have a couple of processes in different stages. This role at Globant is my top choice because it matches exactly what I want to do — deep GCP infrastructure work. I'd move quickly on a good offer.",
    "esText": "Estoy buscando activamente y tengo algunos procesos en distintas etapas. Este rol en Globant es mi primera opción porque combina exactamente con lo que quiero hacer — infraestructura profunda en GCP. Avanzaría rápido con una buena oferta.",
    "category": "Screening",
    "tags": ["other offers", "competing", "otras ofertas"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_health",
    "question": "Do you have any health conditions that might affect your availability?",
    "enText": "No, I'm in good health and fully available to work. I have no conditions that would affect my availability or performance.",
    "esText": "No, estoy saludable y completamente disponible para trabajar. No tengo condiciones que afecten mi disponibilidad o performance.",
    "category": "Screening",
    "tags": ["health", "salud", "availability"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_oncall",
    "question": "Are you comfortable being on-call or handling after-hours incidents?",
    "enText": "Yes, I've been on-call before and I'm comfortable with it. I understand that infrastructure roles sometimes require responding to incidents outside normal hours. I have good monitoring and alerting in place so issues get caught early.",
    "esText": "Sí, estuve de guardia antes y estoy cómodo con eso. Entiendo que roles de infraestructura a veces requieren responder incidents fuera de horario normal. Tengo buen monitoreo y alertas configurados para que los issues se atrapen temprano.",
    "category": "Screening",
    "tags": ["oncall", "after hours", "incident", "guardia"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_overtime",
    "question": "Are you willing to work overtime when the project requires it?",
    "enText": "Yes, I understand that deadlines sometimes require extra effort. I'm willing to put in the hours when needed, as long as it's not the常态. I believe in sustainable pace but I can push when the project demands it.",
    "esText": "Sí, entiendo que deadlines a veces requieren esfuerzo extra. Estoy dispuesto a meter las horas cuando sea necesario, siempre que no sea la常态. Creo en un ritmo sostenible pero puedo presionar cuando el proyecto lo demande.",
    "category": "Screening",
    "tags": ["overtime", "extra hours", "horas extra"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_certifications_plan",
    "question": "Do you have any certifications or plan to get any?",
    "enText": "I have Google Cloud Foundations, IBM AI Engineering, and Meta Backend Developer. I'm planning to pursue the Google Cloud Professional Cloud Architect certification next. I believe in continuous learning and certifications help validate practical knowledge.",
    "esText": "Tengo Google Cloud Foundations, IBM AI Engineering y Meta Backend Developer. Estoy planeando sacar la certificación de Google Cloud Professional Cloud Architect. Creo en el aprendizaje continuo y las certificaciones ayudan a validar conocimiento práctico.",
    "category": "Screening",
    "tags": ["certifications", "google cloud", "plan", "certificaciones"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_last_article_read",
    "question": "What is the last technical article or book you read?",
    "enText": "I recently read about GKE Autopilot best practices and the new features in Terraform 1.x around moved blocks and check mode. I follow the Google Cloud blog and HashiCorp blog regularly to stay current with what's changing in the ecosystem.",
    "esText": "Recientemente leí sobre mejores prácticas de GKE Autopilot y las nuevas features de Terraform 1.x sobre moved blocks y check mode. Sigo el blog de Google Cloud y HashiCorp regularmente para mantenerme al día con los cambios del ecosistema.",
    "category": "Behavioral",
    "tags": ["article", "book", "read", "learning"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_side_projects",
    "question": "Do you have any side projects or personal tech projects?",
    "enText": "Yes, I maintain a personal GCP lab environment where I experiment with new services and configurations. I also built a small tool for interview preparation that uses cloud services. Side projects are how I learn things that aren't yet part of my daily work.",
    "esText": "Sí, mantengo un laboratorio personal de GCP donde experimento con servicios nuevos y configuraciones. También armé una herramienta pequeña para preparación de entrevistas que usa servicios cloud. Los side projects son como aprendo cosas que todavía no son parte de mi trabajo diario.",
    "category": "Behavioral",
    "tags": ["side projects", "personal", "lab", "hobbies"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_communication_style",
    "question": "How would you describe your communication style?",
    "enText": "I'm direct and clear. I prefer to over-communicate rather than leave things ambiguous, especially in remote work. I write concise documentation, give clear status updates, and I'm not afraid to ask questions when something isn't clear.",
    "esText": "Soy directo y claro. Prefiero sobre-comunicar antes que dejar cosas ambiguas, especialmente en trabajo remoto. Escribo documentación concisa, doy actualizaciones de estado claras y no tengo miedo de preguntar cuando algo no está claro.",
    "category": "Behavioral",
    "tags": ["communication", "style", "direct"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_deal_with_ambiguity",
    "question": "How do you handle ambiguity or unclear requirements?",
    "enText": "I ask clarifying questions early rather than making assumptions. If the requirements are vague, I propose a small proof of concept to validate the direction before committing to a full implementation. I'd rather spend an hour asking questions than a week building the wrong thing.",
    "esText": "Preguntas para clarificar temprano en lugar de hacer suposiciones. Si los requisitos son vagos, propongo un proof of concept pequeño para validar la dirección antes de comprometerme con una implementación completa. Prefiero gastar una hora preguntando que una semana construyendo lo incorrecto.",
    "category": "Behavioral",
    "tags": ["ambiguity", "unclear", "questions", "vago"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_be_kind",
    "question": "How do you align with Globant's Be Kind culture?",
    "enText": "I believe in treating colleagues with respect and giving honest, constructive feedback. I'm collaborative and I try to make the people around me better. Being kind doesn't mean avoiding tough conversations — it means having them with empathy and professionalism.",
    "esText": "Creo en tratar a los colegas con respeto y dar feedback honesto y constructivo. Soy colaborativo e intento hacer mejores a las personas a mi alrededor. Ser amable no significa evitar conversaciones difíciles — significa tenerlas con empatía y profesionalismo.",
    "category": "Behavioral",
    "tags": ["be kind", "culture", "values", "culture fit"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_studio_model",
    "question": "What interests you about Globant's studio model?",
    "enText": "I like that studios specialize in specific domains, which means you work with people who really understand the technology. For cloud infrastructure, being in a focused studio means deeper expertise and better solutions for clients. It's a model that rewards depth over generalism.",
    "esText": "Me gusta que los studios se especializan en dominios específicos, lo que significa que trabajás con personas que realmente entienden la tecnología. Para infraestructura cloud, estar en un studio enfocado significa más experiencia y mejores soluciones para clientes. Es un modelo que recompensa la profundidad sobre el generalismo.",
    "category": "Screening",
    "tags": ["studio", "model", "globant", "specialization"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_augmented_coding",
    "question": "What is your experience with AI-assisted development or augmented coding?",
    "enText": "I use AI tools for code generation, documentation, and troubleshooting. They're great for speeding up boilerplate and exploring new APIs. I still review everything carefully — AI is a tool that amplifies your skills but doesn't replace judgment or testing.",
    "esText": "Uso herramientas de IA para generación de código, documentación y troubleshooting. Son geniales para acelerar boilerplate y explorar APIs nuevas. Aún reviso todo con cuidado — la IA es una herramienta que amplifica tus skills pero no reemplaza juicio ni testing.",
    "category": "Technical",
    "tags": ["ai", "augmented coding", "copilot", "llm"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  // ─────────────────────────────────────────────
  // DUPLICATOS EN ESPAÑOL — preguntas personales
  // ─────────────────────────────────────────────

  {
    "id": "globant_es_where_see_5_years",
    "question": "¿Dónde te ves en cinco años?",
    "enText": "I see myself as a senior cloud architect or infrastructure lead, working on complex hybrid environments. I want to keep growing technically while contributing to team leadership.",
    "esText": "Me veo como un arquitecto cloud senior o líder de infraestructura, trabajando en entornos híbridos complejos. Quiero seguir creciendo técnicamente mientras contribuyo a liderazgo de equipo.",
    "category": "Screening",
    "tags": ["cinco años", "futuro", "carrera"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_why_hire",
    "question": "¿Por qué deberíamos contratarte a vos?",
    "enText": "I bring hands-on GCP production experience combined with strong Linux and networking fundamentals. I've built real infrastructure from scratch and I'm a fast learner who works independently.",
    "esText": "Traigo experiencia práctica en GCP producción con fundamentos sólidos de Linux y networking. He construido infraestructura real desde cero y soy rápido aprendiendo e independiente.",
    "category": "Screening",
    "tags": ["por qué vos", "contratar", "valor"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_stress",
    "question": "¿Cómo manejas el estrés o la presión?",
    "enText": "I stay calm and focus on what I can control. I break the problem into smaller pieces and communicate early about blockers.",
    "esText": "Me mantengo calmado y me enfoco en lo que puedo controlar. Divido el problema en partes más pequeñas y comunico temprano sobre bloqueos.",
    "category": "Behavioral",
    "tags": ["estrés", "presión", "calma"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_motivation",
    "question": "¿Qué te motiva o qué te apasiona?",
    "enText": "I'm motivated by solving real problems with technology and the learning curve in cloud because the technology keeps evolving.",
    "esText": "Me motiva resolver problemas reales con tecnología y la curva de aprendizaje en cloud porque la tecnología sigue evolucionando.",
    "category": "Behavioral",
    "tags": ["motivación", "pasión", "qué te gusta"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_globant",
    "question": "¿Qué sabés de Globant?",
    "enText": "Globant is a global technology company known for digital transformation, with over twenty thousand employees across multiple countries. They work with major clients in media, finance, and technology.",
    "esText": "Globant es una empresa tecnológica global conocida por transformación digital, con más de veinte mil empleados en múltiples países. Trabajan con clientes importantes en medios, finanzas y tecnología.",
    "category": "Screening",
    "tags": ["globant", "empresa", "qué sabés"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_hours",
    "question": "¿Qué horarios podés trabajar? ¿Sos flexible?",
    "enText": "I'm flexible with my schedule. I can align with US or European business hours when needed.",
    "esText": "Soy flexible con mi horario. Puedo alinearme con horarios laborales de Estados Unidos o Europa cuando sea necesario.",
    "category": "Screening",
    "tags": ["horarios", "flexible", "disponibilidad"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  // ─────────────────────────────────────────────
  // ESPAÑOL — Behavioral & HR screening (para matching léxico)
  // ─────────────────────────────────────────────
  {
    "id": "globant_es_weakness",
    "question": "¿Cuáles son tus debilidades? ¿En qué puntos deberías trabajar más?",
    "enText": "I tend to go deep on technical solutions before checking if a simpler approach exists. I've gotten better at stepping back and asking if the complexity is really needed. It's a balance between thoroughness and pragmatism.",
    "esText": "Suelo profundizar en soluciones técnicas antes de verificar si existe un enfoque más simple. He mejorado en dar un paso atrás y preguntarme si la complejidad es realmente necesaria. Es un balance entre minuciosidad y pragmatismo.",
    "category": "Behavioral",
    "tags": ["debilidades", "debilidad", "mejorar", "trabajar más", "puntos débiles", "weakness"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_strengths",
    "question": "¿Cuáles son tus fortalezas? ¿En qué sos bueno?",
    "enText": "My main strengths are infrastructure automation with Terraform and troubleshooting under pressure. I also adapt well to distributed teams with fluid bilingual communication.",
    "esText": "Mis principales fortalezas son la automatización de infraestructura con Terraform y el troubleshooting bajo presión en producción. También me adapto bien a equipos distribuidos con comunicación bilingüe fluida.",
    "category": "Behavioral",
    "tags": ["fortalezas", "fortaleza", "bueno", "fuerte", "puntos fuertes", "strength"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_pressure_situation",
    "question": "¿Podrías darme un ejemplo de una situación complicada o donde tuviste que trabajar bajo presión?",
    "enText": "The most intense case was a massive enrollment spike at UBA where the PostgreSQL connection pool collapsed completely. I diagnosed idle-in-transaction connections with pg_stat_activity, terminated them with pg_terminate_backend, and deployed PgBouncer in transaction pooling mode, all without losing a single student transaction.",
    "esText": "El caso más fuerte fue un pico masivo de inscripciones en la UBA donde el pool de conexiones de PostgreSQL colapsó por completo. Diagnosticé conexiones idle in transaction con pg_stat_activity, las terminé con pg_terminate_backend y desplegué PgBouncer en transaction pooling, sin perder una sola transacción de alumnos.",
    "category": "Behavioral",
    "tags": ["presión", "complicada", "situación", "sobrellevar", "bajo presión", "STAR", "ejemplo"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_disagreement",
    "question": "Contame de una vez que discrepaste con un compañero sobre cómo resolver un problema.",
    "enText": "I once disagreed with a teammate about using a shared service account versus Workload Identity Federation for a CI-CD pipeline. I proposed a quick proof of concept to compare both, the demo showed the security benefits clearly, and we ended up using Workload Identity. Showing beats telling.",
    "esText": "Una vez discrepé con un compañero sobre usar una service account compartida versus Workload Identity Federation para un pipeline de CI-CD. Propuse una prueba rápida para comparar ambos, la demo mostró los beneficios de seguridad claramente, y terminamos usando Workload Identity. Demostrar es mejor que decir.",
    "category": "Behavioral",
    "tags": ["discrepar", "desacuerdo", "compañero", "conflicto", "colega", "problema"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_learn_new",
    "question": "¿Podrías contarme de una vez que tuviste que aprender algo nuevo rápido?",
    "enText": "When I joined Reforest I had to pick up GKE Autopilot and ArgoCD for GitOps deployments. I learned by doing — set up a sandbox cluster, broke things, and iterated. Within a couple of weeks I was deploying production workloads with confidence.",
    "esText": "Cuando entré a Reforest tuve que aprender GKE Autopilot y ArgoCD para despliegues GitOps. Aprendí haciendo — armé un cluster sandbox, rompí cosas y fui iterando. En un par de semanas ya estaba desplegando workloads en producción con confianza.",
    "category": "Behavioral",
    "tags": ["aprender", "nuevo", "rápido", "tecnología", "adaptarse"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_proud",
    "question": "¿De qué trabajo te sentís más orgulloso?",
    "enText": "Building the GitOps pipeline at Reforest with ArgoCD and GKE Autopilot. It went from manual deployments to fully automated, with rollback capabilities and zero-downtime releases. Seeing the team ship faster and more safely was really satisfying.",
    "esText": "Armar el pipeline de GitOps en Reforest con ArgoCD y GKE Autopilot. Pasamos de despliegues manuales a completamente automatizados, con capacidad de rollback y releases sin downtime. Ver al equipo entregar más rápido y con más seguridad fue muy gratificante.",
    "category": "Behavioral",
    "tags": ["orgulloso", "orgullo", "logro", "satisfecho", "mejor trabajo"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_explain_non_tech",
    "question": "¿Cómo le explicás decisiones técnicas a alguien que no es técnico?",
    "enText": "I frame things in terms of business outcomes — faster deployments, lower costs, fewer outages — rather than jargon. I use simple analogies and focus on what changed for the user or the business.",
    "esText": "Enmarco las cosas en términos de resultados de negocio — despliegues más rápidos, costos más bajos, menos caídas — en lugar de jerga técnica. Uso analogías simples y me enfoco en qué cambió para el usuario o el negocio.",
    "category": "Behavioral",
    "tags": ["explicar", "no técnico", "comunicar", "stakeholder", "negocio"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_first_90_days",
    "question": "¿Cómo serían tus primeros 90 días en este rol?",
    "enText": "First month: learn the existing infrastructure, meet the team, understand current challenges. Second month: start contributing to small tasks and take on something end-to-end. Third month: enough context to suggest improvements and ship a meaningful contribution.",
    "esText": "Primer mes: aprender la infraestructura existente, conocer al equipo y entender los desafíos actuales. Segundo mes: empezar a contribuir en tareas pequeñas y algo end-to-end. Tercer mes: contexto suficiente para sugerir mejoras y entregar una contribución significativa.",
    "category": "Behavioral",
    "tags": ["primeros días", "90 días", "onboarding", "plan", "arranque"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_feedback",
    "question": "Contame de una vez que recibiste feedback constructivo. ¿Cómo lo tomaste?",
    "enText": "A tech lead pointed out that my Terraform modules were overly complex for the team's level. Instead of getting defensive, I simplified them, added better documentation, and started doing short knowledge-sharing sessions. The team adopted the modules much faster after that.",
    "esText": "Un tech lead me señaló que mis módulos de Terraform eran demasiado complejos para el nivel del equipo. En lugar de ponerme a la defensiva, los simplifiqué, agregué mejor documentación y empecé a hacer sesiones cortas de knowledge-sharing. El equipo adoptó los módulos mucho más rápido después de eso.",
    "category": "Behavioral",
    "tags": ["feedback", "crítica", "constructivo", "mejorar", "retroalimentación"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_team_vs_solo",
    "question": "¿Preferís trabajar solo o en equipo?",
    "enText": "I'm comfortable with both. Remote work requires self-direction, which I enjoy. But I also value collaboration — code reviews, architecture discussions, and pair troubleshooting. The best results come from a team that trusts each other.",
    "esText": "Me siento cómodo con ambos. El trabajo remoto requiere mucha autodirección, lo cual disfruto. Pero también valoro la colaboración — code reviews, discusiones de arquitectura y troubleshooting en pareja. Los mejores resultados vienen de un equipo que se confía.",
    "category": "Behavioral",
    "tags": ["equipo", "solo", "independiente", "colaborar", "team"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_prioritize",
    "question": "¿Cómo priorizás cuando todo parece urgente?",
    "enText": "I focus on business impact first — which task unblocks the most people or reduces the most risk. I communicate early if deadlines conflict, so stakeholders can make informed trade-offs.",
    "esText": "Me enfoco en impacto de negocio primero — cuál tarea desbloquea más gente o reduce más riesgo. Comunico temprano si los deadlines chocan, para que los stakeholders tomen decisiones informadas.",
    "category": "Behavioral",
    "tags": ["priorizar", "urgente", "prioridad", "organizar", "tareas"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_failure_lesson",
    "question": "Contame de un proyecto que no salió como esperabas. ¿Qué aprendiste?",
    "enText": "I once automated a deployment without enough rollback testing. When a config change broke the service, the rollback didn't work cleanly. After that I made rollback testing mandatory in every pipeline. The lesson was: deploy automation is only as good as its undo path.",
    "esText": "Una vez automaticé un despliegue sin suficientes pruebas de rollback. Cuando un cambio de configuración rompió el servicio, el rollback no funcionó limpiamente. Después de eso hice que las pruebas de rollback fueran obligatorias en cada pipeline. La lección fue: la automatización de deploy es tan buena como su camino de vuelta.",
    "category": "Behavioral",
    "tags": ["fracaso", "error", "lección", "aprendiste", "proyecto", "falló"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_go_above",
    "question": "Contame de una vez que fuiste más allá de lo que te pedían.",
    "enText": "At Reforest, I was asked to just set up monitoring alerts. But I noticed the team lacked runbooks, so I also created incident response documentation and trained the team. The alerts went from being noise to actually driving faster incident resolution.",
    "esText": "En Reforest, me pidieron solo configurar alertas de monitoreo. Pero noté que al equipo le faltaban runbooks, así que también creé documentación de respuesta a incidentes y capacité al equipo. Las alertas pasaron de ser ruido a impulsar resolución de incidentes más rápida.",
    "category": "Behavioral",
    "tags": ["más allá", "iniciativa", "extra", "proactivo", "exceder"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_difficult_decision",
    "question": "Contame de una decisión difícil que tuviste que tomar con poca información.",
    "enText": "During a production incident I had to decide between a quick patch that might not hold or a deeper fix that would take the service down for maintenance. With limited data I chose the patch with a monitoring safety net, documented the root cause, and scheduled the proper fix for the next sprint. The patch held.",
    "esText": "Durante un incidente en producción tuve que decidir entre un parche rápido que podía no aguantar o un fix profundo que bajaría el servicio por mantenimiento. Con datos limitados elegí el parche con red de monitoreo, documenté la causa raíz y programé el fix correcto para el siguiente sprint. El parche aguantó.",
    "category": "Behavioral",
    "tags": ["decisión", "difícil", "poca información", "incertidumbre", "ambigüedad"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_other_offers",
    "question": "¿Tenés otras ofertas o estás en otros procesos?",
    "enText": "I'm in conversations with a couple of companies, but this role at Globant is my top priority because of the alignment with GCP and hybrid cloud migration, which is exactly where I want to grow.",
    "esText": "Estoy en conversaciones con un par de empresas, pero este rol en Globant es mi prioridad principal por la alineación con GCP y migración cloud híbrida, que es exactamente donde quiero crecer.",
    "category": "Screening",
    "tags": ["ofertas", "otros procesos", "entrevistas", "competencia", "opciones"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_reverse_questions",
    "question": "¿Tenés alguna pregunta para nosotros o alguna duda?",
    "enText": "Yes, I'd like to know the current phase of the GCVE migration and how collaboration is structured with Intermedia. Also, what observability and CI/CD tools is the team standardizing on?",
    "esText": "Sí, me gustaría saber en qué fase está la migración a GCVE y cómo se estructura el equipo con Intermedia. También me interesa conocer qué herramientas de observabilidad y CI/CD están estandarizando.",
    "category": "Screening",
    "tags": ["preguntas", "dudas", "consultas", "pregunta para nosotros", "reverse questions", "inquietudes"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_home_office",
    "question": "¿Cómo es tu setup de home office o conexión para trabajar remoto?",
    "enText": "I have a dedicated quiet office in Salta with high-speed fiber internet and a secondary mobile backup. I also rely on a UPS to guarantee uninterrupted uptime during power fluctuations.",
    "esText": "Cuento con un espacio dedicado y silencioso en Salta, con fibra óptica de alta velocidad y backup móvil secundario. Además uso una UPS para garantizar disponibilidad ininterrumpida ante cualquier fluctuación eléctrica.",
    "category": "Screening",
    "tags": ["home office", "setup", "conexion", "remoto", "internet", "espacio", "computadora"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  },
  {
    "id": "globant_es_oncall",
    "question": "¿Estás dispuesto a hacer guardias pasivas o soporte on-call si el proyecto lo requiere?",
    "enText": "Yes, I am comfortable with rotating on-call schedules backed by clear runbooks and escalation paths. I value sustainable rotations that resolve critical incidents quickly without causing team burnout.",
    "esText": "Sí, estoy habituado a esquemas de guardias rotativas con runbooks claros y vías de escalado definidas. Valoro rotaciones sostenibles que resuelven incidentes críticos con rapidez sin desgastar al equipo.",
    "category": "Screening",
    "tags": ["guardias", "oncall", "on-call", "soporte", "emergencias", "rotativo", "guardia"],
    "company": "Globant",
    "role": "GCP Cloud Engineer",
    "favorite": true,
    "createdAt": 1789571914325
  }
];

