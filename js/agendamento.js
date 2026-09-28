/* =========================================================
   AGENDAMENTO — CONFIGURAÇÃO
   Edite só este arquivo para mudar barbeiros, fotos,
   WhatsApp e horários. O resto do site se ajusta sozinho.

   O site NÃO reserva nem confirma nada: ele só abre o
   WhatsApp com a mensagem pronta. Quem confirma a vaga
   é a atendente.
   ========================================================= */
window.AGENDAMENTO = {

  // WhatsApp usado quando o cliente escolhe "Sem preferência"
  // (formato: 55 + DDD + número, só números)
  whatsappGeral: '5579999100181',

  // Horários oferecidos (vale para todos os barbeiros que não tiverem os seus próprios)
  horarios: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],

  // "Outro horário": o cliente digita o horário que quiser (ex.: 10:40), dentro deste intervalo
  horarioLivre: { de: '08:00', ate: '19:30' },

  // Dias em que a barbearia NÃO atende: 0 = domingo, 1 = segunda ... 6 = sábado
  diasFechados: [0],

  // Ano mostrado no calendário (de janeiro a dezembro). Dias que já passaram ficam apagados.
  // Em 2027: troque para 2027 e atualize a lista de feriados abaixo.
  ano: 2026,

  // Feriados: aparecem marcados no calendário e com observação.
  // O cliente pode escolher o dia normalmente; a atendente confirma se vai ter atendimento.
  // tipo: 'nacional', 'regional' (Sergipe / Aracaju) ou 'facultativo'
  feriados: [
    { data: '2026-01-01', nome: 'Confraternização Universal', tipo: 'nacional' },
    { data: '2026-02-16', nome: 'Carnaval', tipo: 'facultativo' },
    { data: '2026-02-17', nome: 'Carnaval', tipo: 'facultativo' },
    { data: '2026-03-17', nome: 'Aniversário de Aracaju', tipo: 'regional' },
    { data: '2026-04-03', nome: 'Sexta-feira Santa', tipo: 'nacional' },
    { data: '2026-04-21', nome: 'Tiradentes', tipo: 'nacional' },
    { data: '2026-05-01', nome: 'Dia do Trabalho', tipo: 'nacional' },
    { data: '2026-06-04', nome: 'Corpus Christi', tipo: 'facultativo' },
    { data: '2026-06-24', nome: 'São João', tipo: 'regional' },
    { data: '2026-07-08', nome: 'Emancipação Política de Sergipe', tipo: 'regional' },
    { data: '2026-09-07', nome: 'Independência do Brasil', tipo: 'nacional' },
    { data: '2026-10-12', nome: 'Nossa Senhora Aparecida', tipo: 'nacional' },
    { data: '2026-11-02', nome: 'Finados', tipo: 'nacional' },
    { data: '2026-11-15', nome: 'Proclamação da República', tipo: 'nacional' },
    { data: '2026-11-20', nome: 'Dia da Consciência Negra', tipo: 'nacional' },
    { data: '2026-12-08', nome: 'Nossa Senhora da Conceição (padroeira de Aracaju)', tipo: 'regional' },
    { data: '2026-12-25', nome: 'Natal', tipo: 'nacional' },
  ],

  // Barbeiros: para adicionar outro, copie um bloco { ... } inteiro.
  // "horarios" dentro de um barbeiro é opcional e substitui a lista geral só para ele.
  barbeiros: [
    {
      nome: 'Leon',
      funcao: 'Barbeiro',
      foto: 'assets/img/barbeiro-leon-400.webp',
      whatsapp: '5579999100181',
    },
    {
      nome: 'Camila',
      funcao: 'Barbeira',
      foto: 'assets/img/barbeiro-camila-400.webp',
      whatsapp: '5579999100181',
    },
    {
      nome: 'Heduardo',
      funcao: 'Barbeiro',
      foto: 'assets/img/barbeiro-heduardo-400.webp',
      whatsapp: '5579999100181',
      // horarios: ['09:00', '10:00', '14:00', '15:00'],
    },
  ],
};
