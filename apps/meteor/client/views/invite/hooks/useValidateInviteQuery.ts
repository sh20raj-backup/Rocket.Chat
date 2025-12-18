import { useEndpoint, useSessionDispatch, useSetting, useToastMessageDispatch } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useValidateInviteQuery = (token: string | undefined) => {
	const { t } = useTranslation();

	const registrationForm = useSetting('Accounts_RegistrationForm');

	const setLoginDefaultState = useSessionDispatch('loginDefaultState');
	const dispatchToastMessage = useToastMessageDispatch();

	const handleValidateInviteToken = useEndpoint('POST', '/v1/validateInviteToken');

	const result = useQuery({
		queryKey: ['validateInviteToken', token],
		queryFn: async () => {
			if (!token) {
				return false;
			}

			try {
				const { valid } = await handleValidateInviteToken({ token });

				if (!valid) {
					throw new Error('Invalid token');
				}

				return valid;
			} catch (error) {
				dispatchToastMessage({ type: 'error', message: t('Failed_to_validate_invite_token') });
				return false;
			}
		},
	});

	useEffect(() => {
		if (!token || !result.isFetched) {
			return;
		}

		if (registrationForm !== 'Disabled') {
			setLoginDefaultState('invite-register');
		} else {
			setLoginDefaultState('login');
		}
	}, [registrationForm, result.isFetched, setLoginDefaultState, token]);

	return result;
};
