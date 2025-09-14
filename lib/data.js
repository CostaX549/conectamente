import {
  Calendar,
  Video,
  CreditCard,
  User,
  FileText,
  ShieldCheck,
} from "lucide-react";

// JSON data for features
export const features = [
  {
    icon: <User className="h-6 w-6 text-emerald-400" />,
    title: "Crie Seu Perfil",
    description:
      "Cadastre-se e complete seu perfil para receber recomendações e serviços de saúde personalizados.",
  },
  {
    icon: <Calendar className="h-6 w-6 text-emerald-400" />,
    title: "Agende Consultas",
    description:
      "Explore perfis de médicos, verifique a disponibilidade e agende consultas que se encaixem na sua rotina.",
  },
  {
    icon: <Video className="h-6 w-6 text-emerald-400" />,
    title: "Consulta por Vídeo",
    description:
      "Conecte-se com médicos por meio de consultas em vídeo seguras e de alta qualidade, no conforto da sua casa.",
  },
  {
    icon: <CreditCard className="h-6 w-6 text-emerald-400" />,
    title: "Créditos de Consulta",
    description:
      "Adquira pacotes de créditos que atendam às suas necessidades de saúde com nosso modelo simples de assinatura.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
    title: "Médicos Verificados",
    description:
      "Todos os profissionais de saúde são cuidadosamente avaliados e verificados para garantir atendimento de qualidade.",
  },
  {
    icon: <FileText className="h-6 w-6 text-emerald-400" />,
    title: "Documentação Médica",
    description:
      "Acesse e gerencie seu histórico de consultas, anotações médicas e recomendações de especialistas.",
  },
];

// JSON data for testimonials
export const testimonials = [
  {
    initials: "SP",
    name: "Sarah P.",
    role: "Paciente",
    quote:
      "O recurso de consulta por vídeo me economizou muito tempo. Consegui receber orientação médica sem precisar faltar no trabalho ou me deslocar até uma clínica.",
  },
  {
    initials: "DR",
    name: "Dr. Robert M.",
    role: "Psiquiatra",
    quote:
      "Esta plataforma revolucionou minha prática. Agora consigo atender mais pacientes e oferecer cuidados no tempo certo, sem as limitações de um consultório físico.",
  },
  {
    initials: "JT",
    name: "James T.",
    role: "Paciente",
    quote:
      "O sistema de créditos é muito conveniente. Comprei um pacote para minha família e conseguimos consultar especialistas sempre que precisamos.",
  },
];

// JSON data for credit system benefits
export const creditBenefits = [
  "Cada consulta requer <strong class='text-emerald-400'>2 créditos</strong>, independentemente da duração",
  "Os créditos <strong class='text-emerald-400'>nunca expiram</strong> – use-os sempre que precisar",
  "Assinaturas mensais garantem <strong class='text-emerald-400'>novos créditos todos os meses</strong>",
  "Cancele ou altere sua assinatura <strong class='text-emerald-400'>a qualquer momento</strong> sem penalidades",
];
