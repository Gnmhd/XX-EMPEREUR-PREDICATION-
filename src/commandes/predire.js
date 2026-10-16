import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getPrediction } from '../services/predictionAI.js';

export const data = new SlashCommandBuilder()
  .setName('predire')
  .setDescription("Prédit le résultat d'un match.")
  .addStringOption(option =>
    option.setName('equipe_domicile').setDescription("L'équipe qui reçoit.").setRequired(true))
  .addStringOption(option =>
    option.setName('equipe_exterieur').setDescription("L'équipe qui se déplace.").setRequired(true));

export async function execute(interaction) {
  const homeTeam = interaction.options.getString('equipe_domicile');
  const awayTeam = interaction.options.getString('equipe_exterieur');

  await interaction.deferReply();

  try {
    const prediction = await getPrediction(homeTeam, awayTeam);

    const embed = new EmbedBuilder()
      .setTitle(`🔮 Prédiction : ${homeTeam} vs ${awayTeam}`)
      .setColor(0x00ae86)
      .addFields(
        { name: `🏠 Victoire ${homeTeam}`, value: `${prediction.homeWinProb}%`, inline: true },
        { name: '🤝 Match nul', value: `${prediction.drawProb}%`, inline: true },
        { name: `✈️ Victoire ${awayTeam}`, value: `${prediction.awayWinProb}%`, inline: true }
      )
      .setFooter({ text: "Basé sur l'analyse de données et modèles IA." })
      .setTimestamp();

    if (prediction.odds) {
      embed.addFields({ 
        name: '💰 Cotes (Odds)', 
        value: `Domicile: ${prediction.odds.home} | Nul: ${prediction.odds.draw} | Extérieur: ${prediction.odds.away}`, 
        inline: false 
      });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error(error);
    await interaction.editReply(
      `❌ Impossible de générer une prédiction pour **${homeTeam} vs ${awayTeam}**.\n> ${error.message}`
    );
  }
}
