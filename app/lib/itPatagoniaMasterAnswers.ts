import { MasterAnswer } from "./interviewHelpers";

/**
 * Banco maestro IT Patagonia — DevOps & FinOps Sr (híbrido, 2 días presenciales).
 * Diseñado para la Charla Técnica con el Líder de Infraestructura y Screening.
 * Anclado a ES_Cloud_DevOps_Architect.pdf y a la JD: GitHub/GitLab, AD, WSUS,
 * Proxmox, Hyper-V 2025, Zabbix, Veeam VBR, backups SaaS/Cloud, FinOps en GCP y compliance bancario.
 *
 * Reglas de oro:
 * - Zero-Bullet Mandate: exactamente 2 oraciones por respuesta, sin viñetas.
 * - Discriminar +8 años IT total vs ~4 años cloud/DevOps.
 * - Honestidad técnica: Hyper-V 2025 / SAN / Veeam / AD / WSUS / Zabbix con experiencia real en producción;
 *   Proxmox con dominio conceptual y transferencia de clustering/storage sin sobreventa.
 */
const BASE = {
  company: "ITPatagonia",
  role: "DevOps & FinOps Sr (Técnica & Líder)",
  favorite: true,
  createdAt: 1789580000000,
} as const;

export const IT_PATAGONIA_MASTER_ANSWERS: MasterAnswer[] = [
  // ─────────────────────────────────────────────────────────
  // SECCIÓN 1: SCREENING & PERFIL
  // ─────────────────────────────────────────────────────────
  {
    id: "itp_tell_me_about_yourself",
    question: "Contame sobre vos / recorré tu CV.",
    enText: "I'm Fernando, a systems and cloud engineer with over eight years in IT and about four focused on cloud and infrastructure. I mix on-premise work like Hyper-V, Active Directory and Veeam with GCP, Terraform and FinOps, which is exactly this role's mix.",
    esText: "Soy Fernando, ingeniero de sistemas y cloud, con más de ocho años en IT y unos cuatro enfocados en cloud e infraestructura. Combino on-premise, como Hyper-V, Active Directory y Veeam, con GCP, Terraform y FinOps, que es justo el mix de este puesto.",
    category: "Screening",
    tags: ["presentacion", "contame", "cv", "trayectoria", "about yourself", "background"],
    ...BASE,
  },
  {
    id: "itp_years_experience",
    question: "¿Cuántos años de experiencia tenés como DevOps / SysAdmin?",
    enText: "I have over eight years in IT overall, covering systems, databases and backend. Around four of those are dedicated to cloud, DevOps and Linux infrastructure.",
    esText: "Tengo más de ocho años en IT en total, entre sistemas, bases de datos y backend. Unos cuatro están dedicados específicamente a cloud, DevOps e infraestructura Linux.",
    category: "Screening",
    tags: ["años", "experiencia", "sysadmin", "devops", "seniority", "years"],
    ...BASE,
  },
  {
    id: "itp_why_this_role",
    question: "¿Por qué te interesa esta posición en IT Patagonia?",
    enText: "It combines on-premise infrastructure with cloud and FinOps in one team, which matches what I've done across consulting and platform work. I like owning the whole stack instead of only one layer.",
    esText: "Porque junta infraestructura on-premise con cloud y FinOps en un mismo equipo, que es lo que vengo haciendo entre consultoría y plataforma. Me gusta hacerme cargo de todo el stack y no de una sola capa.",
    category: "Screening",
    tags: ["por que", "interes", "motivacion", "why this role", "it patagonia"],
    ...BASE,
  },
  {
    id: "itp_location",
    question: "¿Dónde vivís? Veo Buenos Aires y Salta en tu CV.",
    enText: "I'm currently in Salta, but I have a home in Buenos Aires, in Almagro. The hybrid schedule with two days on-site is not a problem for me.",
    esText: "Actualmente estoy en Salta, pero tengo casa en Buenos Aires, en Almagro. El esquema híbrido con dos días presenciales no es un problema para mí.",
    category: "Logística",
    tags: ["donde vivis", "ubicacion", "salta", "buenos aires", "almagro", "hibrido", "presencial", "location"],
    ...BASE,
  },
  {
    id: "itp_availability_notice",
    question: "¿Cuándo podrías incorporarte? ¿Tenés preaviso?",
    enText: "I can discuss start dates once we define the process; I'd coordinate a clean handover with my current commitments within a standard two-week window. I am completely flexible to align with your project roadmap.",
    esText: "Podemos definir la fecha cuando avance el proceso; coordinaría un traspaso ordenado con mis compromisos actuales en un plazo estándar de dos semanas. Cuento con total flexibilidad para alinearme con el roadmap del proyecto.",
    category: "Logística",
    tags: ["disponibilidad", "preaviso", "incorporacion", "start date", "cuando podes"],
    ...BASE,
  },
  {
    id: "itp_salary",
    question: "¿Cuál es tu pretensión salarial?",
    enText: "The band of around 5.5 million gross mentioned in the screening fits my expectations. I value the full compensation package, including the bi-annual retention bonuses, Swiss Medical and professional flexibility.",
    esText: "La banda de alrededor de 5.5 millones brutos conversada en el screening se ajusta a mis expectativas. Valoro el paquete integral, incluyendo el bono semestral por permanencia, Swiss Medical y la flexibilidad profesional.",
    category: "Compensación",
    tags: ["salario", "pretension", "sueldo", "banda", "salary", "bruto", "compensacion"],
    ...BASE,
  },
  {
    id: "itp_dependencia",
    question: "El puesto es en relación de dependencia, ¿te sirve?",
    enText: "Yes, I'm fine with a permanent employment relationship. Even though I've done independent consulting, I like the stability and continuity of a long-term team.",
    esText: "Sí, no tengo problema con la relación de dependencia. Aunque hice consultoría independiente, valoro la estabilidad y la continuidad de un equipo a largo plazo.",
    category: "Compensación",
    tags: ["relacion de dependencia", "empleado", "contractor", "monotributo", "dependencia"],
    ...BASE,
  },
  {
    id: "itp_english",
    question: "¿Qué nivel de inglés tenés?",
    enText: "Professional working level, around B2. I read documentation and write in English daily and I'm comfortable in technical conversations.",
    esText: "Nivel profesional de trabajo, alrededor de B2. Leo y escribo documentación en inglés todos los días y me siento cómodo en conversaciones técnicas.",
    category: "Screening",
    tags: ["ingles", "english", "nivel", "idioma"],
    ...BASE,
  },
  {
    id: "itp_banking_clients",
    question: "¿Tenés experiencia trabajando con bancos o clientes corporativos grandes?",
    enText: "I have worked with high-demand financial environments and fintech platforms handling payment infrastructure, compliance and strict uptime. I apply the exact same resilience principles required by traditional banking clients like Santander, Galicia or Macro.",
    esText: "Trabajé con entornos financieros y plataformas fintech gestionando infraestructura de pagos, cumplimiento y alta disponibilidad estricta. Aplico exactamente los mismos principios de resiliencia requeridos por clientes bancarios tradicionales como Santander, Galicia o Macro.",
    category: "Screening",
    tags: ["bancos", "bancario", "clientes", "fintech", "galicia", "santander", "macro", "prisma"],
    ...BASE,
  },

  // ─────────────────────────────────────────────────────────
  // SECCIÓN 2: VIRTUALIZACIÓN ENTERPRISE (HYPER-V 2025 & PROXMOX)
  // ─────────────────────────────────────────────────────────
  {
    id: "itp_hyperv_production",
    question: "Contame tu experiencia desplegando y administrando clústeres Hyper-V en producción.",
    enText: "I deployed a high-availability Hyper-V 2025 cluster over HPE Synergy blade hardware backed by an HPE SAN using Cluster Shared Volumes. The setup included redundant MPIO Round Robin paths, Active Directory integration and automated node failovers.",
    esText: "Desplegué un clúster de alta disponibilidad en Hyper-V 2025 sobre blades HPE Synergy conectado a una SAN HPE con Cluster Shared Volumes. La arquitectura incluyó rutas redundantes MPIO Round Robin, integración con Active Directory y failover automatizado de nodos.",
    category: "On-Premise",
    tags: ["hyper-v", "hyperv", "virtualizacion", "cluster", "failover", "hpe", "san", "csv"],
    ...BASE,
  },
  {
    id: "itp_hyperv_live_migration",
    question: "¿Cómo configurás Live Migration en Hyper-V para evitar saturar el ancho de banda?",
    enText: "I isolate Live Migration traffic onto dedicated 10 or 20 Gbps adapters using SMB Direct with RDMA enabled. This configuration offloads packet processing from host CPUs and prevents migration bursts from impacting production virtual machine traffic.",
    esText: "Aíslo el tráfico de Live Migration en adaptadores dedicados a 10 o 20 Gbps utilizando SMB Direct con RDMA activado. Esta configuración descarga el procesamiento de paquetes de la CPU del host y evita que la migración impacte en el tráfico productivo.",
    category: "On-Premise",
    tags: ["live migration", "rdma", "smb direct", "hyperv migration", "vswitch", "bandwidth"],
    ...BASE,
  },
  {
    id: "itp_hyperv_quorum_split_brain",
    question: "¿Cómo manejás el Quorum en Hyper-V para evitar split-brain en clústeres de nodos pares?",
    enText: "I configure dynamic quorum with a Disk Witness hosted on a dedicated SAN LUN, or an offsite Cloud Witness in GCP or Azure. This guarantees an odd number of active votes, preventing split-brain if node heartbeat communication is temporarily lost.",
    esText: "Configuro quórum dinámico con un Disk Witness en una LUN dedicada de la SAN, o un Cloud Witness en GCP o Azure. Esto garantiza un número impar de votos activos, evitando el split-brain si se interrumpe temporalmente el heartbeat entre nodos.",
    category: "On-Premise",
    tags: ["quorum", "split brain", "witness", "cloud witness", "disk witness", "failover cluster"],
    ...BASE,
  },
  {
    id: "itp_hyperv_csv_mpio",
    question: "¿Qué consideraciones tenés con Cluster Shared Volumes (CSV) y storage MPIO?",
    enText: "I implement Microsoft MPIO with a Round Robin policy across redundant iSCSI or Fibre Channel fabrics to balance I/O throughput. For CSVs, I ensure metadata coordination routes cleanly without forcing nodes into redirected access mode.",
    esText: "Implemento Microsoft MPIO con política Round Robin sobre redes redundantes iSCSI o Fibre Channel para balancear el throughput de I/O. En los CSVs verifico que la coordinación de metadata fluya sin forzar a los nodos a modo de acceso redirigido.",
    category: "On-Premise",
    tags: ["csv", "mpio", "san", "iscsi", "fibre channel", "storage spaces", "round robin"],
    ...BASE,
  },
  {
    id: "itp_proxmox_honest_positioning",
    question: "¿Tenés experiencia con Proxmox VE? ¿Cómo lo compararías con Hyper-V?",
    enText: "My primary production background is with Hyper-V and VMware, but I thoroughly understand Proxmox architecture, Corosync quorum and KVM virtualization. The core principles of shared storage, virtual bridges and clustering translate directly, ensuring a very rapid learning curve.",
    esText: "Mi base principal en producción es con Hyper-V y VMware, pero domino la arquitectura de Proxmox, el quórum por Corosync y la virtualización KVM. Los principios centrales de storage compartido, bridges virtuales y clústeres se trasladan de forma directa, garantizando una curva de aprendizaje mínima.",
    category: "On-Premise",
    tags: ["proxmox", "kvm", "corosync", "qemu", "virtualizacion", "hyperv vs proxmox"],
    ...BASE,
  },
  {
    id: "itp_proxmox_migration",
    question: "¿Cómo migrarías una máquina virtual de Hyper-V o VMware hacia Proxmox?",
    enText: "I convert the virtual disks from VHDX or VMDK to QCOW2 or raw format using `qemu-img` with zero-detection enabled. Before moving, I install the VirtIO drivers inside the guest OS to guarantee clean storage and network recognition during first boot.",
    esText: "Convierto los discos virtuales de VHDX o VMDK a formato QCOW2 o raw utilizando `qemu-img` con detección de ceros activada. Antes de migrar, instalo los controladores VirtIO en el sistema operativo huésped para garantizar reconocimiento limpio de red y storage.",
    category: "On-Premise",
    tags: ["migracion proxmox", "qemu-img", "vhdx a qcow2", "virtio", "convertir vm"],
    ...BASE,
  },

  // ─────────────────────────────────────────────────────────
  // SECCIÓN 3: RESGUARDOS & DRP (VEEAM & BACKUP HYBRID/SAAS)
  // ─────────────────────────────────────────────────────────
  {
    id: "itp_veeam_architecture",
    question: "¿Cómo estructurás una estrategia de resguardo empresarial con Veeam Backup & Replication?",
    enText: "I implement the 3-2-1-1-0 backup rule using forward incremental jobs with synthetic fulls to minimize storage wear and backup windows. I validate all restore points through automated SureBackup verification jobs to guarantee zero corruption.",
    esText: "Implemento la regla 3-2-1-1-0 utilizando respaldos incrementales con fulls sintéticos para minimizar el desgaste del storage y las ventanas de copia. Valido todos los puntos de restauración mediante jobs automatizados de SureBackup para garantizar cero corrupción.",
    category: "Resguardos & DRP",
    tags: ["veeam", "vbr", "3-2-1-1-0", "surebackup", "synthetic full", "resguardos", "backup"],
    ...BASE,
  },
  {
    id: "itp_veeam_ransomware_immutability",
    question: "¿Cómo protegés los backups de Veeam contra ataques de ransomware?",
    enText: "I deploy a Linux Hardened Repository formatted with XFS and native immutability flags, combined with a Scale-Out Backup Repository tiering to cloud Object Lock. Even if domain administrator credentials are compromised, existing recovery points cannot be deleted or altered.",
    esText: "Despliego un Hardened Repository en Linux formateado con XFS y flags de inmutabilidad nativos, combinado con un Scale-Out Backup Repository conectado a Object Storage con Object Lock. Aunque se comprometan credenciales de administrador de dominio, los backups no pueden eliminarse ni alterarse.",
    category: "Resguardos & DRP",
    tags: ["inmutabilidad", "ransomware", "hardened repository", "xfs", "object lock", "sobr"],
    ...BASE,
  },
  {
    id: "itp_veeam_rto_rpo",
    question: "Si una VM crítica de base de datos se corrompe, ¿cómo garantizás un RTO menor a 15 minutos?",
    enText: "I launch Veeam Instant VM Recovery to boot the machine directly from compressed backup storage in under two minutes. Once services are online, I trigger a live background migration to production SAN storage without downtime.",
    esText: "Ejecuto Instant VM Recovery de Veeam para iniciar la máquina virtual directamente desde el storage de backup en menos de dos minutos. Con los servicios online, inicio una migración en vivo hacia la SAN de producción sin tiempo de inactividad.",
    category: "Resguardos & DRP",
    tags: ["instant vm recovery", "rto", "rpo", "contingencia", "drp", "restauracion rapida"],
    ...BASE,
  },
  {
    id: "itp_saas_cloud_backup_strategy",
    question: "¿Cómo gestionás los resguardos de SaaS (Microsoft 365 / Google Workspace) y cargas cloud?",
    enText: "For Microsoft 365, I use Veeam Backup for M365 writing to segregated cloud storage to protect mailboxes, SharePoint and OneDrive from tenant-level deletions. In GCP, I automate multi-region Cloud Snapshots alongside scheduled Cloud SQL exports with lifecycle expiration policies.",
    esText: "Para Microsoft 365 uso Veeam Backup for M365 enviando a storage cloud segregado para proteger correos, SharePoint y OneDrive ante borrados a nivel tenant. En GCP automatizo Cloud Snapshots multirregión y exportaciones programadas de Cloud SQL con políticas de ciclo de vida.",
    category: "Resguardos & DRP",
    tags: ["backup saas", "m365", "workspace", "cloud sql backup", "snapshots gcp", "veeam m365"],
    ...BASE,
  },

  // ─────────────────────────────────────────────────────────
  // SECCIÓN 4: SISTEMAS, ACTIVE DIRECTORY & WSUS
  // ─────────────────────────────────────────────────────────
  {
    id: "itp_ad_replication_troubleshooting",
    question: "Si un Domain Controller secundario falla o pierde sincronización, ¿cómo lo diagnosticás?",
    enText: "I verify DNS resolution and RPC communication first, then run `repadmin /replsummary` and `repadmin /showrepl` to pinpoint the replication error code. I also inspect SYSVOL health and directory events with `dcdiag /v` to rule out journal wraps or USN rollbacks.",
    esText: "Verifico primero la resolución DNS y conectividad RPC, y luego ejecuto `repadmin /replsummary` y `repadmin /showrepl` para identificar el código exacto de error. También analizo la salud de SYSVOL y eventos de directorio con `dcdiag /v` para descartar journal wraps o USN rollbacks.",
    category: "Active Directory",
    tags: ["active directory", "repadmin", "dcdiag", "sysvol", "replicacion", "fsmo", "dns"],
    ...BASE,
  },
  {
    id: "itp_ad_hardening_gpo",
    question: "¿Qué políticas de hardening y seguridad aplicás en Active Directory para entornos bancarios?",
    enText: "I enforce CIS Benchmarks by disabling SMBv1 and LLMNR, mandating LDAP channel binding and requiring SMB signing across all servers. Additionally, I deploy Microsoft LAPS to randomize local administrator passwords and implement an Administrative Tiering model.",
    esText: "Aplico CIS Benchmarks deshabilitando SMBv1 y LLMNR, forzando LDAP channel binding y requiriendo SMB signing en todos los servidores. Además despliego Microsoft LAPS para rotar claves de administrador local e implemento un modelo de administración por niveles (Tiering).",
    category: "Active Directory",
    tags: ["hardening ad", "gpo", "laps", "cis benchmark", "smbv1", "tiering", "ldap signing"],
    ...BASE,
  },
  {
    id: "itp_wsus_patching_strategy",
    question: "¿Cómo organizás el ciclo de parches con WSUS en servidores de producción 24/7?",
    enText: "I structure patch rollouts into three progressive rings: a testing environment, a pilot production subset, and the general production pool. Approvals are tied to defined maintenance windows, ensuring automated cluster node draining and health checks before any reboot.",
    esText: "Estructuro el despliegue de parches en tres anillos progresivos: un entorno de testing, un piloto representativo de producción y el lote productivo general. Las aprobaciones se atan a ventanas de mantenimiento, asegurando drenado de nodos del clúster antes de reiniciar.",
    category: "On-Premise",
    tags: ["wsus", "parches", "patching", "windows update", "anillos de despliegue", "mantenimiento"],
    ...BASE,
  },

  // ─────────────────────────────────────────────────────────
  // SECCIÓN 5: OBSERVABILIDAD & ZABBIX
  // ─────────────────────────────────────────────────────────
  {
    id: "itp_zabbix_proxies_isolated_networks",
    question: "¿Cómo monitoreás servidores en redes bancarias aisladas o DMZs usando Zabbix?",
    enText: "I deploy Zabbix Proxies inside the isolated client network to query local agents and SNMP targets without exposing individual ports. The proxy buffers the telemetry and initiates a single encrypted TLS tunnel back to the central Zabbix Server.",
    esText: "Despliego Zabbix Proxies dentro de la red aislada del cliente para consultar agentes locales y dispositivos SNMP sin abrir puertos individuales. El proxy almacena la telemetría y establece un único túnel TLS cifrado hacia el Zabbix Server central.",
    category: "Observabilidad",
    tags: ["zabbix", "zabbix proxy", "dmz", "snmp", "tls", "red aislada", "monitoreo bancario"],
    ...BASE,
  },
  {
    id: "itp_zabbix_lld_alert_fatigue",
    question: "¿Cómo evitás la fatiga de alertas y los falsos positivos en Zabbix?",
    enText: "I implement Low-Level Discovery (LLD) to automatically discover mount points, interfaces and services while attaching hysteresis triggers to transient spikes. Triggers require sustained thresholds over time windows, preventing alerts from firing during routine garbage collection or temporary CPU bursts.",
    esText: "Implemento Low-Level Discovery (LLD) para descubrir automáticamente file systems, interfaces y servicios, aplicando disparadores con histéresis a picos transitorios. Los triggers exigen umbrales sostenidos en el tiempo, evitando alertas por picos momentáneos de CPU o memoria.",
    category: "Observabilidad",
    tags: ["zabbix lld", "histeresis", "fatiga de alertas", "falsos positivos", "triggers zabbix"],
    ...BASE,
  },

  // ─────────────────────────────────────────────────────────
  // SECCIÓN 6: DEVOPS, TERRAFORM & CI/CD
  // ─────────────────────────────────────────────────────────
  {
    id: "itp_iac_terraform_architecture",
    question: "¿Cómo estructurás tus repositorios y módulos de Terraform para entornos multi-cuenta o multi-proyecto?",
    enText: "I design reusable, semantically versioned modules decoupled from environment state files stored in GCS with object locking. I use Terragrunt or directory-based state separation to keep staging and production isolated without repeating boilerplate code.",
    esText: "Diseño módulos reutilizables versionados semánticamente, desacoplados de los estados remotos almacenados en GCS con object locking. Utilizo separación estricta de estados para mantener staging y producción aislados sin duplicar código de infraestructura.",
    category: "DevOps & IaC",
    tags: ["terraform", "terragrunt", "modulos", "state locking", "gcs backend", "iac"],
    ...BASE,
  },
  {
    id: "itp_cicd_devsecops_pipeline",
    question: "¿Cómo integrás seguridad y validación automática en los pipelines de GitHub Actions o GitLab CI?",
    enText: "I embed `tflint`, `checkov` and Trivy scanning directly into pull request workflows to catch security misconfigurations and container vulnerabilities before review. Terraform plans are annotated with Infracost, and applies only run from protected main branches via OIDC Workload Identity.",
    esText: "Integro escaneos con `tflint`, `checkov` y Trivy en los flujos de pull requests para detectar malas configuraciones y vulnerabilidades antes de la revisión. Los planes de Terraform se anotan con Infracost y los applies corren en ramas protegidas mediante Workload Identity sin keys estáticas.",
    category: "DevOps & IaC",
    tags: ["github actions", "gitlab ci", "checkov", "trivy", "infracost", "devsecops", "oidc"],
    ...BASE,
  },

  // ─────────────────────────────────────────────────────────
  // SECCIÓN 7: FINOPS & OPTIMIZACIÓN CLOUD EN GCP
  // ─────────────────────────────────────────────────────────
  {
    id: "itp_finops_framework_methodology",
    question: "¿Cuál es tu metodología de FinOps cuando tomás una infraestructura cloud con costos descontrolados?",
    enText: "I follow the FinOps Foundation lifecycle: Inform, Optimize, and Operate. First, I stream billing data to BigQuery to establish cost attribution by owner, then right-size overprovisioned workloads, and finally establish automated budget anomaly alerts.",
    esText: "Sigo el ciclo de la FinOps Foundation: Informar, Optimizar y Operar. Primero exporto la facturación a BigQuery para dar visibilidad por responsable, luego ajusto recursos sobredimensionados y finalmente configuro alertas automáticas ante anomalías de gasto.",
    category: "FinOps",
    tags: ["finops framework", "inform optimize operate", "bigquery billing", "anomalias", "costos"],
    ...BASE,
  },
  {
    id: "itp_finops_cuds_commitments",
    question: "¿Cómo definís la compra de Committed Use Discounts (CUDs) sin comprometer la flexibilidad arquitectónica?",
    enText: "I analyze historical resource utilization over a 90-day baseline and commit to Flexible or Resource-based CUDs covering only 60 to 70 percent of constant usage. The remaining dynamic peak load is handled via horizontal autoscaling and Spot VMs to maximize savings without lock-in risk.",
    esText: "Analizo la utilización histórica en una línea base de 90 días y adquiero CUDs flexibles que cubran solo entre el 60 y 70 por ciento del uso constante. La carga elástica restante la absorbo con autoescalado dinámico y Spot VMs para maximizar ahorro sin riesgo de lock-in.",
    category: "FinOps",
    tags: ["cuds", "committed use discounts", "spot vms", "ahorro gcp", "reservas", "finops"],
    ...BASE,
  },
  {
    id: "itp_finops_governance_tagging",
    question: "¿Cómo asegurás la gobernanza de etiquetas (labels/tags) para que ningún recurso quede sin responsable?",
    enText: "I enforce GCP Organization Policies and Terraform validation checks that block provisioning if mandatory labels like `cost-center`, `environment` and `owner` are missing. I pair this with Looker Studio dashboards that highlight untagged resources to team leaders weekly.",
    esText: "Aplico políticas organizacionales en GCP y validaciones en Terraform que bloquean la creación de recursos si faltan etiquetas obligatorias como `cost-center`, `environment` y `owner`. Complemento esto con tableros en Looker Studio que alertan a los líderes sobre recursos huérfanos.",
    category: "FinOps",
    tags: ["etiquetado", "tagging", "labels gcp", "organization policies", "gobernanza", "cost center"],
    ...BASE,
  },
  {
    id: "itp_hybrid_connectivity_gcp_onprem",
    question: "¿Cómo diseñarías la conectividad de red segura entre el datacenter on-premise y GCP?",
    enText: "I establish Dedicated or Partner Cloud Interconnect with High Availability, backed by an IPsec Cloud VPN with dynamic BGP routing for redundancy. Internal traffic routes privately via Cloud Router, Cloud NAT and Private Google Access without exposing public IPs.",
    esText: "Establezco Cloud Interconnect dedicado o Partner con Alta Disponibilidad, respaldado por un Cloud VPN IPsec con ruteo dinámico BGP para contingencia. El tráfico interno se rige por Cloud Router, Cloud NAT y Private Google Access sin exponer IPs públicas a internet.",
    category: "Arquitectura Cloud",
    tags: ["cloud interconnect", "cloud vpn", "bgp", "cloud router", "private google access", "hibrido"],
    ...BASE,
  },

  // ─────────────────────────────────────────────────────────
  // SECCIÓN 8: CIERRE & PREGUNTAS AL LÍDER TÉCNICO
  // ─────────────────────────────────────────────────────────
  {
    id: "itp_tech_lead_questions",
    question: "¿Tenés alguna pregunta técnica para mí sobre el equipo o la infraestructura?",
    enText: "Yes: how is the team currently balancing virtualization maintenance between Hyper-V and Proxmox versus GCP projects? Also, what is your biggest infrastructure pain point today: standardization of CI/CD pipelines or hybrid cost governance?",
    esText: "Sí: ¿cómo tienen balanceada hoy la carga de trabajo entre los hipervisores on-premise y los proyectos en GCP? Y además, ¿cuál es hoy el mayor cuello de botella del equipo: la estandarización de pipelines de CI/CD o la gobernanza de costos en clientes externos?",
    category: "Cierre Técnico",
    tags: ["preguntas lider", "cierre tecnico", "questions for team lead", "feedback", "roadmap"],
    ...BASE,
  },
];
