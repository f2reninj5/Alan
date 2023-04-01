
import { Message } from 'discord.js'

class Bucket {

    public lines: number
    public timestamp: number

    public constructor() {

        this.lines = 0
        this.timestamp = Date.now()
    }
}

class GuildMessageSpamCache {

    private guildId: string
    private secondsCacheSettingsAge: number
    private maxLines!: number
    private linesPerSecond!: number
    private buckets: { [key: string]: Bucket }
    private settingsExpires: number

    public constructor(guildId: string, secondsCacheSettingsAge: number) {

        this.guildId = guildId
        this.secondsCacheSettingsAge = secondsCacheSettingsAge
        this.buckets = {}
        this.settingsExpires = 0

        this.updateSettings()
    }

    private createBucket(memberId: string): void {

        this.buckets[memberId] = new Bucket()
    }

    private createBucketIfNone(memberId: string): void {

        if (!this.doesBucketExist(memberId)) {

            this.createBucket(memberId)
        }
    }

    private doesBucketExist(memberId: string): boolean {

        return (Object.keys(this.buckets).includes(memberId))
    }

    private updateBucket(memberId: string, lines: number): void {

        const SECOND = 1000

        let bucket = this.buckets[memberId]
        let now = Date.now()
        let secondsDifference = (now - bucket.timestamp) / SECOND

        bucket.lines += lines - (this.linesPerSecond * secondsDifference)

        if (bucket.lines < 0) { bucket.lines = 0 }

        bucket.timestamp = now
    }

    private isBucketOverflowing(memberId: string): boolean {

        let bucket = this.buckets[memberId]

        return (bucket.lines > this.maxLines)
    }

    private async updateSettings(): Promise<void> {

        const SECOND = 1000

        let newSettings = await this.fetchSettings()

        this.maxLines = newSettings.maxLines
        this.linesPerSecond = newSettings.linesPerSecond
        this.settingsExpires = Date.now() + (this.secondsCacheSettingsAge * SECOND)
    }

    private async updateSettingsIfExpired(): Promise<void> {

        let now = Date.now()

        if (now > this.settingsExpires) {

            this.updateSettings()
        }
    }

    private async fetchSettings() {

        return {

            linesPerSecond: 2,
            maxLines: 20
        }
    }

    public async isMemberSpamming(memberId: string, lines: number): Promise<boolean> {

        await this.updateSettingsIfExpired()

        this.createBucketIfNone(memberId)
        this.updateBucket(memberId, lines)

        return this.isBucketOverflowing(memberId)
    }
}

export class MessageSpamCacheManager {

    private caches: { [key: string]: GuildMessageSpamCache } = {}
    private secondsCacheSettingsAge: number

    public constructor(secondsCacheSettingsAge: number) {

        this.secondsCacheSettingsAge = secondsCacheSettingsAge
    }

    private createCache(guildId: string): void {

        this.caches[guildId] = new GuildMessageSpamCache(guildId, this.secondsCacheSettingsAge)
    }

    private createCacheIfNone(guildId: string): void {

        if (!this.doesCacheExist(guildId)) {

            this.createCache(guildId)
        }
    }

    private doesCacheExist(guildId: string): boolean {

        return (Object.keys(this.caches).includes(guildId))
    }

    public async isMemberSpamming(message: Message): Promise<boolean> {

        if (!message.guild) {

            throw 'message guild not found'
        }

        this.createCacheIfNone(message.guild.id)

        let memberId = message.author.id
        let lines = message.content.length / 40
        let cache = this.caches[message.guild.id]

        return cache.isMemberSpamming(memberId, lines)
    }
}
