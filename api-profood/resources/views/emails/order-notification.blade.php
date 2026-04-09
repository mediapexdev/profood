<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Notification de commande</title>
    </head>
    <body style="margin:0;">
        <main>
            <div
                bg="#ffffff"
                text="#121212"
                style="background-color:transparent;color:#121212;padding:48px 0;font-size:16px;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                sans-serif;max-width:600px;margin:0 auto;"
            >
                <table
                    cellpadding="0"
                    cellspacing="0"
                    style="width:100%;background:#f7f7f9;padding:10px;border-radius:4px;"
                >
                    <thead>
                        <tr>
                            <td style="padding:16px;text-align:center;">
                                <img
                                    alt="ADEPME"
                                    style="display:inline-block;height:auto;width:130px;text-align:center;padding:0;margin:0 0 10px 0;"
                                    src="https://www.profood-app.com/app/media/images/logos/profood-new.png"
                                />
                            </td>
                        </tr>
                    </thead>
                    <tbody style="background-color:#ffffff;">
                        <tr>
                            <td style="padding:6px 24px 0 24px;margin:0;border-radius:6px 6px 0 0;">
                                <p style="color:#121212;font-size:16px;line-height:22px;font-weight:400;">
                                    <span style="font-size:16px;font-weight:600;line-height:24px;display:inline-block;margin-bottom:10px">Salut,</span>
                                    <br>
                                    <span style="display:inline-block;">Une nouvelle commande vient d'être passée.</span>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:8px 24px;color:#424242;font-size:16px;line-height:180%;">
                                <span style="color:#424242;">Date de la commande</span>
                                <br>
                                <span style="color:#424242;font-weight:600;">{{(new IntlDateFormatter(
                                    'fr_SN',
                                    IntlDateFormatter::FULL,
                                    IntlDateFormatter::SHORT,
                                    'Africa/Dakar',
                                    IntlDateFormatter::GREGORIAN
                                ))->format(new \DateTime($order->created_at))}}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:8px 24px;color:#424242;font-size:16px;line-height:180%;">
                                <span style="color:#424242;">Numéro de la commande</span>
                                <br>
                                <span style="color:#424242;font-weight:600;">{{$order->string_id}}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:8px 24px 24px 24px;color:#424242;font-size:16px;line-height:180%;border-radius:0 0 6px 6px;">
                                <span style="color:#424242;">Client(e)</span>
                                <br>
                                <span style="color:#424242;font-weight:600;">{{$order->customer->fullName()}}</span>
                            </td>
                        </tr>
                    </tbody>
                    {{-- <tfoot>
                        <tr>
                            <td style="padding:32px 24px 32px 24px;color:#424242;font-size:16px;line-height:150%;text-align:right;">Cachet et signature de l'ADEPME</td>
                        </tr>
                    </tfoot> --}}
                </table>
            </div>
        </main>
    </body>
</html>
