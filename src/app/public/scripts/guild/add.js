
$('[type=checkbox]').on('change', function (event) {

    let enableAutoChannels = $('#auto-channels-checkbox').prop('checked')
    let enableLogChannel = $('#enable-log-channel-checkbox').prop('checked')

    $('#config-form-manual-channels-div').css('display', (enableAutoChannels ? 'none' : 'flex'))
    $('#alert-channel-select').prop('disabled', enableAutoChannels)
    $('#log-channel-select').prop('disabled', (!enableLogChannel || enableAutoChannels))
})
