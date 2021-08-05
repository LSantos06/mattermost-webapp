// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {injectIntl, IntlShape} from 'react-intl';

import IconButton from '@mattermost/compass-components/components/icon-button';

import {Permissions} from 'mattermost-redux/constants';
import {UserProfile} from 'mattermost-redux/types/users';

import * as GlobalActions from 'actions/global_actions';
import AboutBuildModal from 'components/about_build_modal';
import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';
import MarketplaceModal from 'components/plugin_marketplace';
import Menu from 'components/widgets/menu/menu';

import {ModalIdentifiers} from 'utils/constants';
import {useSafeUrl} from 'utils/url';
import * as UserAgent from 'utils/user_agent';

type Props = {
    isMobile: boolean;
    id: string;
    teamId: string;
    teamName: string;
    siteName: string;
    currentUser: UserProfile;
    appDownloadLink: string;
    enableCommands: boolean;
    enableIncomingWebhooks: boolean;
    enableOAuthServiceProvider: boolean;
    enableOutgoingWebhooks: boolean;
    canManageSystemBots: boolean;
    canManageIntegrations: boolean;
    enablePluginMarketplace: boolean;
    pluginMenuItems: any;
    intl: IntlShape;
    firstAdminVisitMarketplaceStatus: boolean;
};

class ProductSwitcherMenu extends React.PureComponent<Props> {
    static defaultProps = {
        teamType: '',
        isMobile: false,
        pluginMenuItems: [],
    };

    handleEmitUserLoggedOutEvent = () => {
        GlobalActions.emitUserLoggedOutEvent();
    }

    render() {
        const {currentUser} = this.props;

        if (!currentUser) {
            return null;
        }

        const someIntegrationEnabled = this.props.enableIncomingWebhooks || this.props.enableOutgoingWebhooks || this.props.enableCommands || this.props.enableOAuthServiceProvider || this.props.canManageSystemBots;
        const showIntegrations = !this.props.isMobile && someIntegrationEnabled && this.props.canManageIntegrations;

        const {formatMessage} = this.props.intl;

        return (
            <>
                <Menu.Group>
                    <SystemPermissionGate permissions={Permissions.SYSCONSOLE_READ_PERMISSIONS}>
                        <Menu.ItemLink
                            id='systemConsole'
                            show={!this.props.isMobile}
                            to='/admin_console'
                            text={formatMessage({id: 'navbar_dropdown.console', defaultMessage: 'System Console'})}
                            icon={
                                <IconButton
                                    className={'product-switcher-icon'}
                                    size={'sm'}
                                    icon='application-cog'
                                />
                            }
                        />
                    </SystemPermissionGate>
                    <Menu.ItemLink
                        id='integrations'
                        show={showIntegrations}
                        to={'/' + this.props.teamName + '/integrations'}
                        text={formatMessage({id: 'navbar_dropdown.integrations', defaultMessage: 'Integrations'})}
                        icon={
                            <IconButton
                                className={'product-switcher-icon'}
                                size={'sm'}
                                icon='webhook-incoming'
                            />
                        }
                    />
                    <TeamPermissionGate
                        teamId={this.props.teamId}
                        permissions={[Permissions.SYSCONSOLE_WRITE_PLUGINS]}
                    >
                        <Menu.ItemToggleModalRedux
                            id='marketplaceModal'
                            modalId={ModalIdentifiers.PLUGIN_MARKETPLACE}
                            show={!this.props.isMobile && this.props.enablePluginMarketplace}
                            dialogType={MarketplaceModal}
                            text={formatMessage({id: 'navbar_dropdown.marketplace', defaultMessage: 'Marketplace'})}
                            showUnread={!this.props.firstAdminVisitMarketplaceStatus}
                            icon={
                                <IconButton
                                    className={'product-switcher-icon'}
                                    size={'sm'}
                                    icon='apps'
                                />
                            }
                        />
                        <Menu.ItemExternalLink
                            id='nativeAppLink'
                            show={this.props.appDownloadLink && !UserAgent.isMobileApp()}
                            url={useSafeUrl(this.props.appDownloadLink)}
                            text={formatMessage({id: 'navbar_dropdown.nativeApps', defaultMessage: 'Download Apps'})}
                            icon={
                                <IconButton
                                    className={'product-switcher-icon'}
                                    size={'sm'}
                                    icon='download-outline'
                                />
                            }
                        />
                        <Menu.ItemToggleModalRedux
                            id='about'
                            modalId={ModalIdentifiers.ABOUT}
                            dialogType={AboutBuildModal}
                            text={formatMessage({id: 'navbar_dropdown.about', defaultMessage: 'About {appTitle}'}, {appTitle: this.props.siteName})}
                            icon={
                                <IconButton
                                    className={'product-switcher-icon'}
                                    size={'sm'}
                                    icon='information-outline'
                                />
                            }
                        />
                    </TeamPermissionGate>
                </Menu.Group>
            </>
        );
    }
}

export default injectIntl(ProductSwitcherMenu);
