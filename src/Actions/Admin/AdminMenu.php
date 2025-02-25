<?php

namespace MailerPress\Actions\Admin;

\defined('ABSPATH') || exit;

use MailerPress\Core\Attributes\Action;

class AdminMenu
{
    public static function mailerpressRoot(): void
    {
        ?>
        <div id="mailerpress"></div>
        <?php
    }

    public static function mailpressCampaigns(): void
    {
        ?>
        <div id="mailerpress-root"></div>
        <?php
    }

    #[Action('admin_menu')]
    public function adminMenu(): void
    {
        add_menu_page(
            __('MailerPress', 'mailerpress'),
            __('MailerPress', 'mailerpress'),
            'manage_options',
            'mailerpress/campaigns.php',
            [$this, 'mailerpressRoot'],
            'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iQ2FscXVlXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnNlcmlmPSJodHRwOi8vd3d3LnNlcmlmLmNvbS8iIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDEwNTguMSA4NzMuOSI+CiAgPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI5LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDIuMS4wIEJ1aWxkIDEwOCkgIC0tPgogIDxkZWZzPgogICAgPHN0eWxlPgogICAgICAuc3QwIHsKICAgICAgICBmaWxsOiAjMWUxZDFkOwogICAgICB9CiAgICA8L3N0eWxlPgogIDwvZGVmcz4KICA8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMzE4LjMsMzg3LjhjMCwwLS4xLDAtLjIsMC0uNiwwLTEsLjUtMSwxaDBjMS4zLDk3LjYsMS45LDE5NS4yLDEuOSwyOTMsMCwzMiw0LjEsNTMuMiwzMC45LDY2LjcsNS45LDMsMTYuMyw0LjQsMzEuMSw0LjMsMTgwLjMtMSwzNDYuMy0uOSw0OTcuOS40LDQ1LjcuNCw2OC41LTIyLjksNjguNS02OS45LS4yLTUzLjEtLjUtMjE0LjgtLjgtNDg1LjEsMC0yMC45LTEuMy0zNC4yLTMuOS0zOS44LTUuNy0xMi4yLTEzLjYtMjItMjMuOC0yOS4xLTctNC45LTE4LjctNy40LTM1LjEtNy40LTIzOC41LDAtNDc2LjkuMS03MTUuNCwwLTIyLDAtMzguMSw4LTQ4LjIsMjQtNS45LDkuNS04LjgsMjQuNC04LjYsNDQuOSwxLjEsMTU1LjcsMi4zLDMwNi4zLDMuNCw0NTEuOCwwLDIuNC0xLjcsNC40LTQuMSw0LjgtMjYuMSw0LjItNTAuNCw0LjQtNzIuNi0xMi4yQzEyLjgsNjE2LC4xLDU4OS42LjEsNTU2LjEsMCwzMjYuMywwLDE5Ny40LDAsMTY5LjMtLjEsMTA5LjksMjQsNjMuNCw3Mi41LDI5LjcsMTA4LDUsMTM4LjIsMCwxODQuOCwwYzMwOC4yLjIsNTM4LjYuMiw2OTEuMS4yLDc5LjIsMCwxMzUuOCwzNiwxNjkuNywxMDgsNi43LDE0LjEsMTAsMzAuOSwxMC4xLDUwLjQsMS4yLDI3Mi42LDIsNDU0LjEsMi41LDU0NC42LjMsNTAuOC0xOS43LDkzLjYtNjAuMSwxMjguMi0zNy41LDMyLjEtNzEuOCw0MS45LTEyNC40LDQyLTMwLjMsMC0xODQuOS4zLTQ2My44LjUtNDYuNCwwLTc2LjYtMi40LTkwLjYtNy41LTUxLjEtMTguMi05Ni42LTY3LTEwNi4yLTEyMi4zLTEtNS45LTEuNi0yOC4zLTEuNy02Ny4xLS44LTE1OS43LS44LTMxMC4xLDAtNDUxLjEsMC0zLjEsMS42LTQuNyw0LjctNC43aDk3LjRjNC4yLDAsOC4yLDEuOCwxMSw0LjlsMjAyLjcsMjI0LjRjMCwwLC4xLjEuMi4yLDIuMywyLjMsNi4xLDIuMyw4LjQsMCwwLDAsLjEtLjEuMi0uMmwyMDAtMjIxLjZjNC4yLTQuNiwxMC4xLTcuMiwxNi4yLTcuMmg4NS45YzIuNCwwLDQuNCwyLDQuNCw0LjR2NDE1LjZjMCwxLjctLjgsMi42LTIuNSwyLjZoLTk3LjljLTEuNiwwLTMtMS4zLTMtM3YtMjQ3LjljMC01LjgtMS45LTYuNS01LjYtMi4xbC0xOTcuMywyMjcuNmMtLjgsMS0yLDEuNS0zLjMsMS41cy0yLjItLjUtMy0xLjNjLTcxLjgtNzEtMTM2LjItMTQ3LjQtMjA3LjUtMjI5LTEuMi0xLjMtMi41LTIuMS0zLjktMi40WiIvPgo8L3N2Zz4=',
            20
        );

        add_submenu_page(
            'mailerpress/campaigns.php',
            __('New Campaign', 'mailerpress'),
            __('New Campaign', 'mailerpress'),
            'manage_options',
            'mailerpress/new',
            [$this, 'mailpressCampaigns']
        );

        do_action('mailerpress/admin_menu', 'mailerpress/campaigns.php');

        add_submenu_page(
            'mailerpress/campaigns.php',
            __('Upgrade', 'mailerpress'),
            __('Upgrade', 'mailerpress'),
            'manage_options',
            'mailerpress%2Fcampaigns.php&path=%2Fhome%2Fsettings&activeView=Upgrade',
            [$this, 'mailpressCampaigns']
        );
    }
}
