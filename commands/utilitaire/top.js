const Discord = require('discord.js')
const db = require('quick.db')
const {
	MessageActionRow,
	MessageButton,
	MessageMenuOption,
	MessageMenu
} = require('discord-buttons');

module.exports = {
	name: 'top',
	aliases: ['leaderboard'],
	run: async (client, message, args, prefix, color) => {

		let perm = ""
		message.member.roles.cache.forEach(role => {
			if (db.get(`modsp_${message.guild.id}_${role.id}`)) perm = true
			if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true
			if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true
		})
		if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm || db.get(`channelpublic_${message.guild.id}_${message.channel.id}`) === true) {
			if (args[0] === "rank" || args[0] === "level") {

				let money = db.all().filter(data => data.ID.startsWith(`guild_${message.guild.id}_xp`)).sort((a, b) => b.data - a.data)
				let p0 = 0;
				let p1 = 5;
				let page = 1;

				const embed = new Discord.MessageEmbed()

					.setTitle('Classement Rank')
					.setDescription(money.filter(x => message.guild.members.cache.get(x.ID.split('_')[3])).map((m, i) => `${i + 1}) **${client.users.cache.get(m.ID.split('_')[3]).tag}** : Niveau **${db.get(`guild_${message.guild.id}_level_${m.ID.split('_')[3]}`) || 0}** (*XP total : ${m.data || 0}*)`).slice(0, 5))
					.setFooter(`${page}/${Math.ceil(money.length === 0?1:money.length / 5)} • ${client.config.name}`)
					.setTimestamp()
					.setColor(color)

				message.channel.send(embed).then(async tdata => {
					if (money.length > 5) {
						const B1 = new MessageButton()
							.setLabel("◀")
							.setStyle("gray")
							.setID('toprank1');

						const B2 = new MessageButton()
							.setLabel("▶")
							.setStyle("gray")
							.setID('toprank2');

						const bts = new MessageActionRow()
							.addComponent(B1)
							.addComponent(B2)

						tdata.edit("", {
							embed: embed,
							components: [bts]
						})
						setTimeout(() => {
							tdata.edit("", {
								components: [],
								embed: new Discord.MessageEmbed()

									.setTitle('Classement Rank')
									.setDescription(money.filter(x => message.guild.members.cache.get(x.ID.split('_')[3])).map((m, i) => `${i + 1}) **${client.users.cache.get(m.ID.split('_')[3]).tag}** : Niveau **${db.get(`guild_${message.guild.id}_level_${m.ID.split('_')[3]}`) || 0}** (*XP total : ${m.data || 0}*)`).slice(0, 5))
									.setFooter(`1/${Math.ceil(money.length === 0?1:money.length / 5)} • ${client.config.name}`)
									.setTimestamp()
									.setColor(color)


							})
						}, 60000 * 5)

						client.on("clickButton", (button) => {
							if (button.clicker.user.id !== message.author.id) return;
							if (button.id === "toprank1") {
								button.reply.defer(true)

								p0 = p0 - 5;
								p1 = p1 - 5;
								page = page - 1

								if (p0 < 0) {
									return
								}
								if (p0 === undefined || p1 === undefined) {
									return
								}

								embed.setDescription(money.filter(x => message.guild.members.cache.get(x.ID.split('_')[3])).map((m, i) => `${i + 1}) **${client.users.cache.get(m.ID.split('_')[3]).tag}** : Niveau **${db.get(`guild_${message.guild.id}_level_${m.ID.split('_')[3]}`) || 0}** (*XP total : ${m.data || 0}*)`).slice(p0, p1))
								embed.setFooter(`${page}/${Math.ceil(money.length === 0?1:money.length / 5)} • ${client.config.name}`)
								embed.setTimestamp()
								tdata.edit(embed);

							}

							if (button.id === "toprank2") {
								button.reply.defer(true)

								p0 = p0 + 5;
								p1 = p1 + 5;

								page++;

								if (p1 > money.length + 5) {
									return
								}
								if (p0 === undefined || p1 === undefined) {
									return
								}


								embed.setDescription(money.filter(x => message.guild.members.cache.get(x.ID.split('_')[3])).map((m, i) => `${i + 1}) **${client.users.cache.get(m.ID.split('_')[3]).tag}** : Niveau **${db.get(`guild_${message.guild.id}_level_${m.ID.split('_')[3]}`) || 0}** (*XP total : ${m.data || 0}*)`).slice(p0, p1))
								embed.setFooter(`${page}/${Math.ceil(money.length === 0?1:money.length / 5)} • ${client.config.name}`)
								embed.setTimestamp()
								tdata.edit(embed);
							}
						})
					}
				})
			}
		}
	}
}
