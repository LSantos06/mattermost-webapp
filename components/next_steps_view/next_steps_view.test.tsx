// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Team} from 'mattermost-redux/types/teams';

import NextStepsView from 'components/next_steps_view/next_steps_view';
import {TestHelper} from 'utils/test_helper';

describe('components/next_steps_view', () => {
    const baseProps = {
        steps: [
            {
                id: 'step_1',
                roles: [],
                title: {
                    titleId: 'Step_1',
                    titleMessage: 'Step_1',
                },
                component: jest.fn(),
                visible: true,
            },
            {
                id: 'step_2',
                title: {
                    titleId: 'Step_2',
                    titleMessage: 'Step_2',
                },
                roles: [],
                component: jest.fn(),
                visible: true,
            },
            {
                id: 'step_3',
                title: {
                    titleId: 'Step_3',
                    titleMessage: 'Step_3',
                },
                roles: [],
                component: jest.fn(),
                visible: true,
            },
        ],
        currentUser: TestHelper.getUserMock(),
        preferences: [],
        isFirstAdmin: true,
        isAdmin: true,
        isCloud: false,
        team: {name: 'TestTeam'} as Team,
        downloadAppsAsNextStep: false,
        actions: {
            setShowNextStepsView: jest.fn(),
            savePreferences: jest.fn(),
            closeRightHandSide: jest.fn(),
            getProfiles: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <NextStepsView {...baseProps}/>,
        );
        wrapper.setState({show: true});

        expect(wrapper).toMatchSnapshot();
    });

    test('should return complete if pref exists', () => {
        const props = {
            ...baseProps,
            preferences: [{
                category: 'recommended_next_steps',
                name: 'step_1',
                user_id: 'user_id',
                value: 'true',
            }],
        };

        const wrapper = shallow<NextStepsView>(
            <NextStepsView {...props}/>,
        );

        expect(wrapper.instance().isStepComplete('step_1')).toBe(true);
        expect(wrapper.instance().isStepComplete('step_2')).toBe(false);
    });

    test('should expand next step when previous step is marked complete', () => {
        const wrapper = shallow<NextStepsView>(
            <NextStepsView {...baseProps}/>,
        );

        const setExpanded = jest.fn();
        wrapper.instance().nextStep(setExpanded, 'step_1');
        expect(setExpanded).toBeCalledWith('step_2');
    });

    test('should go to first incomplete step when last step is marked complete', () => {
        const wrapper = shallow<NextStepsView>(
            <NextStepsView {...baseProps}/>,
        );

        const setExpanded = jest.fn();
        wrapper.instance().nextStep(setExpanded, 'step_3');
        expect(setExpanded).toBeCalledWith('step_1');
    });

    test('should cascade through all steps when all marked complete', () => {
        const props = {
            ...baseProps,
            preferences: [
                {
                    category: 'recommended_next_steps',
                    name: 'step_1',
                    user_id: 'user_id',
                    value: 'true',
                },
                {
                    category: 'recommended_next_steps',
                    name: 'step_2',
                    user_id: 'user_id',
                    value: 'true',
                },
                {
                    category: 'recommended_next_steps',
                    name: 'step_3',
                    user_id: 'user_id',
                    value: 'true',
                },
            ],
        };
        jest.useFakeTimers();

        const wrapper = shallow<NextStepsView>(
            <NextStepsView {...props}/>,
        );

        wrapper.instance().transitionToFinalScreen = jest.fn();
        wrapper.instance().nextStep(jest.fn(), 'step_1');
        jest.runOnlyPendingTimers();
        expect(wrapper.instance().transitionToFinalScreen).toBeCalled();
    });
});
