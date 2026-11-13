const { InteractionType } = require("discord.js");
const { Database } = require("st.db");
const { red } = require('chalk');

const BStats = new Database("./settings/models/stats.json", { databaseInObject: true });

module.exports = async(client, interaction) => {
    if (interaction.isChatInputCommand() || interaction.isContextMenuCommand() || interaction.isAutocomplete()) {
        if (!interaction.guild || interaction.user.bot) return;

        await client.createExSetup(interaction);
        await client.createExVoice(interaction);

        let subCommandName = "";
        try {
            subCommandName = interaction.options.getSubcommand();
        } catch { };
        let subCommandGroupName = "";
        try {
            subCommandGroupName = interaction.options.getSubcommandGroup();
        } catch { };

        if (interaction.type == InteractionType.ApplicationCommandAutocomplete) {
            if (interaction.commandName === "play" || subCommandName === "playskip" || subCommandName === "playtop") {
                const query = interaction.options.getString("search")?.trim();
                const choice = query ? [{ name: query.slice(0, 100), value: query.slice(0, 100) }] : [];
                return interaction.respond(choice).catch(console.error);
            }
        }

        const command = client.slash.find(command => {
            switch (command.name.length) {
            case 1: return command.name[0] == interaction.commandName;
            case 2: return command.name[0] == interaction.commandName && command.name[1] == subCommandName;
            case 3: return command.name[0] == interaction.commandName && command.name[1] == subCommandGroupName && command.name[2] == subCommandName;
            }
        });

    if (!command) return;
    if (command) {
        try {
            await client.addCount(command.name.at(-1));
            await command.run(client, interaction);
            const count = BStats.all().find((i) => i.ID === command.name.at(-1))?.data ?? 0;
            console.log(`[COMMAND] ${command.name.at(-1)} executed by ${interaction.user.tag} | [${client.user.tag}] in ${interaction.guild.name} (${interaction.guild.id}) | Total Used: ${count} times.`);
        } catch (error) {
            console.log(error);
            if (interaction.replied || interaction.deferred) await interaction.followUp({ content: `Something went wrong!`, ephemeral: true }).catch(console.error);
            else await interaction.reply({ content: `Something went wrong!`, ephemeral: true }).catch(console.error);
        }}
    }
}
