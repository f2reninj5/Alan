
import { Events } from 'discord.js'
import Client from '../Client'
import { MessageSpamCacheManager } from '../models/features/FastMessageSpamDetector'

const MINUTE = 60
const spamCacheManager = new MessageSpamCacheManager(5 * MINUTE)

Client.on(Events.MessageCreate, async (message) => {

    if (message.author.bot) { return }

    if (await spamCacheManager.isMemberSpamming(message)) {

        message.react('❌')

        return

    } else {

        message.react('✅')

        return
    }
})
