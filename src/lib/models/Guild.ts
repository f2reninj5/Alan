import Database from "../Database"

const DAY = 1000 * 60 * 60 * 24

interface GuildData {

    name?: string,
    icon_url?: string,
    member_count?: number,
    deleted?: boolean
}

interface GuildSettingsData {

    region: number,
    log_channel_id?: string,
    alert_channel_id: string
}

export default class Guild {

    private static cacheTimeToLive = 7 * DAY

    public static async upsert(id: string, data: GuildData) {

        let now = new Date().getTime()
        let guildData = { guild_id: id, ...data, expires: new Date(now + this.cacheTimeToLive) }
        let columns = []
        let values = []

        for (let property in guildData) {

            columns.push(property)
            // @ts-ignore
            values.push(guildData[property])
        }

        return Database.upsert('guilds', columns, values)
    }

    public static async upsertSettings(id: string, data: GuildSettingsData) {

        let guildSettingsData = { guild_id: id, ...data }
        let columns = []
        let values = []

        for (let property in guildSettingsData) {

            columns.push(property)
            // @ts-ignore
            values.push(guildSettingsData[property])
        }

        return Database.upsert('guild_settings', columns, values)
    }
}
