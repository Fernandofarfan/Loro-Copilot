const fs = require('fs');
const path = require('path');

const baseItems = JSON.parse(fs.readFileSync('scratch/base_answers.json', 'utf-8'));

const globantSpecific = [
  {
    id: 'globant_gcve_core',
    question: 'What is Google Cloud VMware Engine (GCVE) and when should it be used?',
    enText: 'Google Cloud VMware Engine provides a fully dedicated, certified VMware stack running natively on Google Cloud bare-metal infrastructure. It is ideal for enterprise lift-and-shift migrations to eliminate on-premise datacenter debt with zero application refactoring while preserving existing vSphere operational tooling.',
    esText: 'GCVE ofrece un stack nativo de VMware sobre bare-metal de Google Cloud, ideal para migrar cargas empresariales sin refactorizar aplicaciones y eliminando costos de datacenter.',
    category: 'Technical',
    tags: ['gcve', 'vmware', 'gcp', 'cloud', 'migration'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_gcve_networking',
    question: 'How do you interconnect GCVE with native GCP VPCs and on-premise datacenters?',
    enText: 'We peer GCVE with the customer native GCP VPC using Private Services Access over high-speed redundant links, with Cloud Router managing BGP route exchanges. For on-premise connectivity, we terminate dedicated Cloud Interconnect or Cloud VPN to route directly into VMware NSX-T edge routers without hairpinning.',
    esText: 'Conectamos GCVE a la VPC nativa mediante Private Services Access y Cloud Router con BGP, y enlazamos on-premise con Cloud Interconnect directo a NSX-T.',
    category: 'Technical',
    tags: ['gcve', 'networking', 'vpc', 'interconnect', 'router'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_vmware_migration',
    question: 'How do you execute virtual machine migrations from on-premise to GCVE or Compute Engine?',
    enText: 'We use VMware HCX with vMotion and Replication-Assisted vMotion to perform zero-downtime bulk migrations across stretched Layer 2 networks. For workloads converting directly to native Compute Engine, we leverage Google Cloud Migrate to Virtual Machines with background replication and test clones.',
    esText: 'Usamos VMware HCX con vMotion para migraciones masivas sin downtime sobre redes L2 extendidas, y Migrate to Virtual Machines para conversión directa a Compute Engine.',
    category: 'Technical',
    tags: ['hcx', 'vmware', 'migration', 'vmotion', 'compute'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_terraform_structure',
    question: 'How do you structure infrastructure as code using Terraform for enterprise GCP environments?',
    enText: 'I follow the Google Cloud Foundation Fabric blueprint, dividing code into modular environments for networking, IAM, compute, and security with remote states in GCS with object versioning. We enforce least privilege through dedicated service accounts and validate pull requests with tfsec and automated CI/CD plans.',
    esText: 'Estructuro Terraform con el blueprint Foundation Fabric, separando módulos de red, IAM y compute con state remoto versionado en GCS y validaciones automáticas.',
    category: 'Technical',
    tags: ['terraform', 'iac', 'gcp', 'modules', 'ci/cd'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_python_automation',
    question: 'How do you use Python for infrastructure automation in Google Cloud?',
    enText: 'I develop serverless Python automations using the official google-cloud-compute and google-cloud-storage SDKs, triggered by Eventarc or Cloud Scheduler via Cloud Functions. Common use cases include automated snapshot lifecycles, orphaned disk cleanup, and real-time security remediation based on Cloud Audit Logs.',
    esText: 'Desarrollo automatizaciones en Python con los SDKs oficiales en Cloud Functions y Cloud Scheduler, para rotación de snapshots, limpieza de discos y remediación de seguridad.',
    category: 'Technical',
    tags: ['python', 'automation', 'sdk', 'cloud functions', 'scripts'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_vpc_design',
    question: 'How do you design an enterprise VPC architecture in GCP?',
    enText: 'I implement a Shared VPC topology where host projects centrally manage network firewalls, subnets, and Cloud Routers, while service projects deploy isolated workloads. We place Cloud NAT for outbound internet access and configure Private Google Access so instances reach GCP APIs without public IP addresses.',
    esText: 'Implemento Shared VPC centralizando subredes, firewalls y Cloud Routers en el host project, con Cloud NAT y Private Google Access para evitar IPs públicas.',
    category: 'Technical',
    tags: ['vpc', 'shared vpc', 'networking', 'cloud nat', 'subnets'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_load_balancing',
    question: 'How does Google Cloud Load Balancing work and how do you handle traffic routing?',
    enText: 'Google Cloud external Application Load Balancers use a single global anycast VIP to route traffic into the nearest Google POP, drastically reducing TLS handshake latency. Backend services utilize instance groups with HTTP health checks, URL routing maps, and Google-managed SSL certificates with automatic zero-downtime renewal.',
    esText: 'Uso Cloud Load Balancing con IP Anycast global para enrutar al POP más cercano, con certificados SSL administrados y health checks hacia instance groups.',
    category: 'Technical',
    tags: ['load balancer', 'anycast', 'ssl', 'routing', 'pop'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_cloud_armor',
    question: 'How do you protect enterprise GCP infrastructure from DDoS and OWASP Top 10 attacks?',
    enText: 'We deploy Cloud Armor security policies at the external load balancer tier to filter layer-7 attacks and block malicious IP ranges before traffic touches backend compute. In addition, we configure preconfigured WAF rules for SQL injection and cross-site scripting alongside adaptive rate limiting policies.',
    esText: 'Aplico Cloud Armor en el balanceador externo para filtrar ataques L7, rate limiting adaptativo y reglas WAF preconfiguradas contra inyección SQL y XSS.',
    category: 'Technical',
    tags: ['cloud armor', 'security', 'waf', 'ddos', 'firewall'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_gke_experience',
    question: 'What is your experience with Kubernetes and Google Kubernetes Engine (GKE)?',
    enText: 'I manage both GKE Standard and Autopilot clusters, configuring multi-zone node pools with cluster autoscaler and workload identity federation for secure GCP API access. I write declarative Helm charts and Kustomize overlays integrated with GitOps pipelines for zero-downtime rolling updates.',
    esText: 'Administro clusters de GKE con Workload Identity, cluster autoscaler en multi-zona y despliegues declarativos con Helm y GitOps para rolling updates.',
    category: 'Technical',
    tags: ['gke', 'kubernetes', 'helm', 'k8s', 'containers'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_linux_troubleshooting',
    question: 'How do you troubleshoot a sudden connection timeout or high latency on a Linux instance in GCP?',
    enText: 'I start by inspecting serial console port logs and local network sockets with ss and netstat, verifying local firewalls with iptables or nftables. If local metrics are clean, I check GCP VPC Flow Logs and Firewall Rules logging in Cloud Logging to confirm whether packets are dropped by network security policies.',
    esText: 'Reviso la consola serie, puertos con ss y reglas de firewall locales; luego audito VPC Flow Logs en Cloud Logging para identificar bloqueos de red en GCP.',
    category: 'Technical',
    tags: ['linux', 'troubleshooting', 'ss', 'sockets', 'logs', 'latency'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_ha_dr',
    question: 'How do you architect disaster recovery for critical workloads in GCP?',
    enText: 'We define multi-region active-passive or active-active topologies depending on RPO and RTO requirements, utilizing Cloud Storage cross-region dual-bucket replication and scheduled persistent disk snapshots. For database tiers, we configure Cloud SQL with cross-region read replicas and automated failover.',
    esText: 'Diseño arquitecturas multi-región según RPO/RTO con Cloud Storage dual-region, snapshots programados de discos y réplicas de lectura cross-region en Cloud SQL.',
    category: 'Architecture',
    tags: ['dr', 'disaster recovery', 'rpo', 'rto', 'multi-region'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_iam_least_privilege',
    question: 'How do you enforce IAM security and manage service accounts in GCP?',
    enText: 'I enforce the principle of least privilege using predefined or custom IAM roles instead of broad primitive Owner or Editor roles. For third-party and CI/CD pipelines, I eliminate long-lived service account keys by implementing Workload Identity Federation with short-lived OAuth tokens.',
    esText: 'Aplico mínimo privilegio con roles personalizados, eliminando claves JSON fijas mediante Workload Identity Federation con tokens temporales de corta vida.',
    category: 'Security',
    tags: ['iam', 'least privilege', 'service accounts', 'security', 'oauth'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_finops_costs',
    question: 'How do you optimize infrastructure costs in GCP without compromising performance?',
    enText: 'I analyze GCP Billing reports and Recommender insights to implement Committed Use Discounts for baseline compute alongside custom VM sizing to eliminate overprovisioning. We also apply Cloud Storage lifecycle rules to transition cold backups to Nearline or Archive storage tiers automatically.',
    esText: 'Optimizo costos con Committed Use Discounts, ajuste de CPU/RAM con Recommender y políticas de ciclo de vida en Cloud Storage hacia Nearline y Archive.',
    category: 'Technical',
    tags: ['finops', 'costs', 'cud', 'billing', 'storage tiers'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_monitoring_observability',
    question: 'How do you set up monitoring and alerting for enterprise cloud infrastructure in GCP?',
    enText: 'I implement Cloud Monitoring dashboards tracking golden signals—latency, traffic, errors, and saturation—using Ops Agent metrics from compute instances. Alerting policies are integrated with PagerDuty or Slack with defined dynamic thresholds to notify on anomalous CPU spikes, disk exhaustion, or 5xx error spikes.',
    esText: 'Configuro Cloud Monitoring con Ops Agent para rastrear latencia, saturación y errores, integrando alertas automatizadas a Slack y PagerDuty ante anomalías.',
    category: 'Technical',
    tags: ['monitoring', 'observability', 'alerts', 'ops agent', 'pagerduty'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_agile_pods',
    question: 'How do you collaborate in agile teams and Globants Agile Pods model?',
    enText: 'I thrive in cross-functional Agile Pods where engineers take full end-to-end ownership of infrastructure deliverables through two-week sprints and continuous feedback loops. I prioritize transparent communication with client stakeholders, blameless retrospectives, and clear technical documentation to maintain high delivery velocity.',
    esText: 'Trabajo en Agile Pods con ownership de punta a punta, sprints de dos semanas, retrospectivas sin culpa y comunicación transparente con los clientes de Globant.',
    category: 'Behavioral',
    tags: ['agile pods', 'globant', 'sprints', 'collaboration', 'agile'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_why_join',
    question: 'Why are you interested in joining Globant and working on this Intermedia project?',
    enText: 'Globant is a recognized global digital leader, and this project represents the ideal synergy between my deep hands-on expertise in GCP and enterprise-scale infrastructure transformation. I am motivated to solve complex hybrid virtualization challenges with GCVE while automating cloud operations with Terraform and Python.',
    esText: 'Globant es referente global y este proyecto combina mi experiencia práctica en GCP con desafíos enterprise de GCVE, automatización con Terraform y Python.',
    category: 'Screening',
    tags: ['why globant', 'intermedia', 'motivation', 'fit'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_salary_rate',
    question: 'What are your salary expectations for this hourly contractor role?',
    enText: 'For this full-time contractor engagement, my target hourly rate is between twenty-five and thirty dollars per hour, which aligns with my four thousand dollar monthly benchmark. I am fully accustomed to the international contractor model and ready to start immediately.',
    esText: 'Para este esquema contractor full-time mi tarifa de referencia se sitúa entre 25 y 30 USD por hora, equivalente a unos 4,000 USD mensuales brutos.',
    category: 'Screening',
    tags: ['salary', 'rate', 'hourly', 'contractor', 'usd'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_experience_strict',
    question: 'How many years of experience do you have in cloud and software engineering?',
    enText: 'I bring over eight years of comprehensive background in software engineering, backend systems, and IT infrastructure. For the last four years, I have been dedicated exclusively to enterprise Google Cloud Platform, Terraform, Linux environments, and DevOps automation.',
    esText: 'Sumo más de 8 años de trayectoria en sistemas, desarrollo y software, con los últimos ~4 años dedicados exclusivamente a GCP, Terraform y DevOps.',
    category: 'Screening',
    tags: ['experience', 'years', 'background', 'seniority'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_smalltalk_pets',
    question: 'Do you have any pets or animals at home?',
    enText: 'Yes, I do! I have a rescued dog named Luna who was adopted from the street and is my daily remote work companion here in Salta. We go on walks to disconnect from the screen, and she brings great positive energy to my daily routine.',
    esText: '¡Sí, totalmente! Tengo una perrita adoptada que se llama Luna en Salta; salimos a caminar para despejar la vista del monitor y resetear el foco mental.',
    category: 'Screening',
    tags: ['pets', 'dog', 'luna', 'salta', 'small talk'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_smalltalk_hobbies',
    question: 'What do you do in your free time or on weekends?',
    enText: 'In my free time, I love cycling outdoors around the scenic hills of Salta and spending time with my family and dog Luna. I also enjoy tinkering with my home-lab infrastructure to experiment with new cloud tools.',
    esText: 'Me encanta salir a pedalear al aire libre por Salta, compartir tiempo con mi perrita Luna y experimentar en mi home-lab con herramientas cloud.',
    category: 'Screening',
    tags: ['hobbies', 'free time', 'cycling', 'weekends', 'salta'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_incident_resolution',
    question: 'Tell me about a time you resolved a critical production incident or technical disagreement.',
    enText: 'During a major cloud migration, we detected intermittent packet drops across our hybrid interconnect tunnel that threatened client deadlines. I coordinated a live tcpdump trace and MTU audit, identified mismatched jumbo frame configurations on the edge router, and applied an automated fix within two hours.',
    esText: 'Durante una migración detectamos caídas intermitentes en el túnel híbrido; coordiné una traza de tcpdump, corregí el MTU en el router y normalicé el tráfico en 2 horas.',
    category: 'Behavioral',
    tags: ['incident', 'star', 'troubleshooting', 'conflict', 'mtu'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_databases_gcp',
    question: 'What database and compute options do you recommend for enterprise workloads in GCP?',
    enText: 'For relational transactional workloads requiring high availability, I configure Cloud SQL with automated cross-zone failover and point-in-time recovery. For high-throughput analytics or massive cache layers, we combine BigQuery with Memorystore for Redis to minimize database read pressure.',
    esText: 'Para transacciones recomiendo Cloud SQL con failover cross-zone y backups continuos, complementado con Memorystore para Redis para cachear lecturas de alta concurrencia.',
    category: 'Architecture',
    tags: ['cloud sql', 'database', 'redis', 'memorystore', 'bigquery'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_linux_tools',
    question: 'Which Linux commands and diagnostic tools do you rely on during troubleshooting?',
    enText: 'I use ss to inspect open sockets and connection states, lsof to identify file handle and port locks, and journalctl alongside dmesg to catch kernel panic or OOM killer events. For performance bottlenecks, I combine vmstat, iostat, and htop to pinpoint CPU steal time or disk I/O wait.',
    esText: 'Uso ss para sockets, lsof para descriptores de archivo, journalctl y dmesg para eventos de kernel y OOM, y vmstat o iostat para identificar saturación de I/O.',
    category: 'Technical',
    tags: ['linux tools', 'ss', 'lsof', 'journalctl', 'htop', 'diagnostics'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_cicd_pipelines',
    question: 'How do you implement CI/CD deployment pipelines for cloud infrastructure?',
    enText: 'I build automated pipelines using GitHub Actions or Cloud Build that run terraform fmt, tfsec linting, and automated plan generation on every pull request. Merges to main trigger state locks and phased canary applies, ensuring all infrastructure changes are peer-reviewed and fully auditable.',
    esText: 'Construyo pipelines en GitHub Actions y Cloud Build con validación de tfsec, planes automáticos en PRs y despliegues auditados tras merge a la rama principal.',
    category: 'Technical',
    tags: ['ci/cd', 'github actions', 'cloud build', 'terraform', 'automation'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  },
  {
    id: 'globant_reverse_questions',
    question: 'Do you have any questions for us about Globant or the project?',
    enText: 'Yes! Could you tell me more about the current stage of this GCP infrastructure project—is the primary focus on initial GCVE workload migration or long-term Terraform automation? Also, how is the engineering team structured between Globant and Intermedia?',
    esText: '¿Podrías contarme en qué fase está el proyecto: si el foco prioritario es la migración inicial con GCVE o la automatización con Terraform? ¿Y cómo interactúa el equipo con Intermedia?',
    category: 'Screening',
    tags: ['questions for them', 'reverse questions', 'cierre', 'team'],
    company: 'Globant',
    role: 'GCP Cloud Engineer',
    favorite: true,
    createdAt: Date.now()
  }
];

const allAnswers = [...globantSpecific, ...baseItems];
console.log('Total combined master answers:', allAnswers.length);

const outPath = path.join(__dirname, '../app/lib/globantMasterAnswers.ts');
const fileData = 'import { MasterAnswer } from "./interviewHelpers";\n\nexport const GLOBANT_AND_GCP_MASTER_ANSWERS: MasterAnswer[] = ' + JSON.stringify(allAnswers, null, 2) + ';\n';
fs.writeFileSync(outPath, fileData, 'utf-8');
console.log('Written to ' + outPath + ' successfully!');
