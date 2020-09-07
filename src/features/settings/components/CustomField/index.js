// @flow

import React from 'react';
import { View, Text } from 'react-native';
import { Field, change } from 'redux-form';
import { alertMe, hasObjectLength, hasLength } from '@/api/global';
import Lng from '@/api/lang/i18n';
import { goBack, MOUNT, UNMOUNT } from '@/navigation/actions';
import { BUTTON_COLOR } from '@/api/consts';
import {
    InputField,
    CtButton,
    DefaultLayout,
    ToggleSwitch,
    SelectPickerField
} from '@/components';
import {
    setCustomFieldRefs,
    DEFAULT_INPUT_FIELD,
    DEFAULT_NUMBER_FIELD,
    DEFAULT_DATE_FIELD,
    DEFAULT_TIME_FIELD,
    PLACEHOLDER_FIELD,
    DEFAULT_TEXTAREA_FIELD,
    SELECT_FIELD_OPTIONS,
    SELECT_FIELD_DEFAULT_VALUE,
    DEFAULT_CHECKBOX_FIELD,
    DEFAULT_DATE_TIME_FIELD
} from './options';
import {
    EDIT_CUSTOM_FIELD_TYPE,
    CREATE_CUSTOM_FIELD_TYPE,
    CUSTOM_FIELD_FORM,
    CUSTOM_FIELDS as FIELDS,
    DATA_TYPE_OPTION_VALUE as OPTION_VALUE,
    CUSTOM_FIELD_MODAL_TYPES as MODAL_TYPES,
    CUSTOM_FIELD_DATA_TYPE_LIST as DATA_TYPES
} from '../../constants';
import styles from './styles';

type IProps = {
    navigation: Object,
    formValues: Object,
    handleSubmit: Function,
    createCustomField: Function,
    editCustomField: Function,
    getCustomField: Function,
    removeCustomField: Function,
    language: String,
    type: String,
    loading: boolean,
    id: Number,
    field: any,
    getCustomFieldLoading: boolean,
    removeCustomFieldLoading: boolean
};

export class CustomField extends React.Component<IProps> {
    constructor(props) {
        super(props);
        this.customFieldRefs = setCustomFieldRefs.bind(this);
        this.state = {};
    }

    componentDidMount() {
        const { navigation, type, dispatch, getCustomField, id } = this.props;
        goBack(MOUNT, navigation);

        if (type === EDIT_CUSTOM_FIELD_TYPE) {
            getCustomField({
                id,
                onResult: res => {
                    const field = {
                        ...res,
                        [FIELDS.DEFAULT_VALUE]:
                            res.defaultAnswer || res.default_answer
                    };
                    dispatch(change(CUSTOM_FIELD_FORM, FIELDS.FIELD, field));
                }
            });
        }
    }

    componentWillUnmount() {
        this.customFieldRefs(undefined);
        goBack(UNMOUNT);
    }

    setFormField = (field, value) => {
        const fieldName = `${FIELDS.FIELD}.${field}`;
        this.props.dispatch(change(CUSTOM_FIELD_FORM, fieldName, value));
    };

    onSubmit = ({ field }) => {
        const {
            id,
            type,
            createCustomField,
            editCustomField,
            navigation,
            loading,
            formValues,
            getCustomFieldLoading,
            removeCustomFieldLoading
        } = this.props;

        if (
            !loading &&
            !getCustomFieldLoading &&
            !removeCustomFieldLoading &&
            formValues
        ) {
            if (type === CREATE_CUSTOM_FIELD_TYPE)
                createCustomField({ params: field, navigation });
            else {
                editCustomField({ id, params: field, navigation });
            }
        }
    };

    removeField = () => {
        const { removeCustomField, navigation, language, id } = this.props;

        alertMe({
            title: Lng.t('alert.title', { locale: language }),
            desc: Lng.t('customFields.removeAlertDescription', {
                locale: language
            }),
            showCancel: true,
            okPress: () => removeCustomField({ id, navigation })
        });
    };

    onChangeReset = () => {
        this.setFormField(FIELDS.DEFAULT_VALUE, '');
        this.setFormField(FIELDS.PLACEHOLDER, '');
        this.setFormField(FIELDS.OPTIONS, []);
    };

    BOTTOM_ACTION = handleSubmit => {
        const {
            language,
            loading,
            type,
            removeCustomFieldLoading
        } = this.props;

        return (
            <View
                style={[
                    styles.submitButton,
                    type === EDIT_CUSTOM_FIELD_TYPE && styles.multipleButton
                ]}
            >
                <CtButton
                    onPress={handleSubmit(this.onSubmit)}
                    btnTitle={Lng.t('button.save', { locale: language })}
                    buttonContainerStyle={
                        type === EDIT_CUSTOM_FIELD_TYPE && styles.flex
                    }
                    containerStyle={styles.btnContainerStyle}
                    loading={loading}
                />

                {type === EDIT_CUSTOM_FIELD_TYPE && (
                    <CtButton
                        onPress={this.removeField}
                        btnTitle={Lng.t('button.remove', {
                            locale: language
                        })}
                        buttonColor={BUTTON_COLOR.DANGER}
                        containerStyle={styles.btnContainerStyle}
                        buttonContainerStyle={styles.flex}
                        loading={removeCustomFieldLoading}
                        isLoading={removeCustomFieldLoading}
                    />
                )}
            </View>
        );
    };

    REQUIRE_FIELD_VIEW = () => {
        const { language } = this.props;
        return (
            <View style={[styles.row, { marginTop: 10 }]}>
                <View style={styles.positionView}>
                    <Text style={styles.textStyle}>
                        {Lng.t('customFields.required', {
                            locale: language
                        })}
                    </Text>
                </View>

                <View style={styles.column}>
                    <Field
                        name={`${FIELDS.FIELD}.${FIELDS.IS_REQUIRED}`}
                        component={ToggleSwitch}
                        switchStyle={{ marginRight: 100 }}
                        hintStyle={styles.leftText}
                    />
                </View>
            </View>
        );
    };

    DISPLAY_PORTAL_TOGGLE_VIEW = () => {
        const { language } = this.props;
        return (
            <View style={styles.row}>
                <View style={styles.positionView}>
                    <Text style={styles.textStyle}>
                        {Lng.t('customFields.displayInPortal', {
                            locale: language
                        })}
                    </Text>
                </View>

                <View style={styles.column}>
                    <Field
                        name={`${FIELDS.FIELD}.${FIELDS.DISPLAY_PORTAL}`}
                        component={ToggleSwitch}
                        hint={Lng.t('customFields.no', {
                            locale: language
                        })}
                        hintStyle={styles.leftText}
                    />
                </View>

                <View style={styles.columnRight}>
                    <Text style={styles.textStyle}>
                        {Lng.t('customFields.yes', { locale: language })}
                    </Text>
                </View>
            </View>
        );
    };

    DATA_TYPE_OPTION_BASE_VIEW = () => {
        const { formValues } = this.props;
        let dataType = formValues?.[FIELDS.FIELD]?.[FIELDS.TYPE];
        let optionView = [];

        switch (dataType) {
            case OPTION_VALUE.INPUT:
                optionView = [DEFAULT_INPUT_FIELD(), PLACEHOLDER_FIELD()];
                break;

            case OPTION_VALUE.TEXTAREA:
                optionView = [DEFAULT_TEXTAREA_FIELD(), PLACEHOLDER_FIELD()];
                break;

            case OPTION_VALUE.PHONE:
                optionView = [DEFAULT_INPUT_FIELD(), PLACEHOLDER_FIELD()];
                break;

            case OPTION_VALUE.URL:
                optionView = [DEFAULT_INPUT_FIELD(), PLACEHOLDER_FIELD()];
                break;

            case OPTION_VALUE.NUMBER:
                optionView = [DEFAULT_NUMBER_FIELD(), PLACEHOLDER_FIELD()];
                break;

            case OPTION_VALUE.DROPDOWN:
                optionView = [
                    SELECT_FIELD_OPTIONS(),
                    SELECT_FIELD_DEFAULT_VALUE(),
                    PLACEHOLDER_FIELD()
                ];
                break;

            case OPTION_VALUE.SWITCH:
                optionView = [DEFAULT_CHECKBOX_FIELD()];
                break;

            case OPTION_VALUE.DATE:
                optionView = [DEFAULT_DATE_FIELD(), PLACEHOLDER_FIELD()];
                break;

            case OPTION_VALUE.TIME:
                optionView = [DEFAULT_TIME_FIELD(), PLACEHOLDER_FIELD()];
                break;

            case OPTION_VALUE.DATE_TIME:
                optionView = [DEFAULT_DATE_TIME_FIELD(), PLACEHOLDER_FIELD()];

            default:
                break;
        }

        return !hasLength(optionView) ? <></> : optionView;
    };

    render() {
        const {
            navigation,
            handleSubmit,
            language,
            type,
            formValues,
            getCustomFieldLoading
        } = this.props;

        this.customFieldRefs(this);

        const isLoading =
            !formValues ||
            !hasObjectLength(formValues) ||
            getCustomFieldLoading;

        return (
            <DefaultLayout
                headerProps={{
                    leftIconPress: () => {
                        navigation.goBack(null);
                    },
                    title:
                        type === EDIT_CUSTOM_FIELD_TYPE
                            ? Lng.t('header.editCustomField', {
                                  locale: language
                              })
                            : Lng.t('header.addCustomField', {
                                  locale: language
                              }),
                    placement: 'center',
                    rightIcon: 'save',
                    rightIconProps: {
                        solid: true
                    },
                    rightIconPress: handleSubmit(this.onSubmit)
                }}
                bottomAction={this.BOTTOM_ACTION(handleSubmit)}
                loadingProps={{ is: isLoading }}
            >
                <View style={styles.bodyContainer}>
                    <Field
                        name={`${FIELDS.FIELD}.${FIELDS.NAME}`}
                        component={InputField}
                        isRequired
                        hint={Lng.t('customFields.name', {
                            locale: language
                        })}
                        inputProps={{
                            returnKeyType: 'next',
                            autoCorrect: true
                        }}
                    />

                    <Field
                        name={`${FIELDS.FIELD}.${FIELDS.MODAL_TYPE}`}
                        component={SelectPickerField}
                        label={Lng.t('customFields.model', {
                            locale: language
                        })}
                        fieldIcon="align-center"
                        items={MODAL_TYPES}
                        defaultPickerOptions={{
                            label: Lng.t('customFields.modelPlaceholder', {
                                locale: language
                            }),
                            value: ''
                        }}
                        isRequired
                    />

                    {this.REQUIRE_FIELD_VIEW()}

                    <Field
                        name={`${FIELDS.FIELD}.${FIELDS.TYPE}`}
                        label={Lng.t('customFields.type', {
                            locale: language
                        })}
                        component={SelectPickerField}
                        isRequired
                        fieldIcon="align-center"
                        items={DATA_TYPES}
                        defaultPickerOptions={{
                            label: Lng.t('customFields.typePlaceholder', {
                                locale: language
                            }),
                            value: ''
                        }}
                        onChangeCallback={() => this.onChangeReset()}
                        callbackWhenMount={() => {}}
                    />

                    <Field
                        name={`${FIELDS.FIELD}.${FIELDS.LABEL}`}
                        component={InputField}
                        isRequired
                        hint={Lng.t('customFields.label', {
                            locale: language
                        })}
                        inputProps={{
                            returnKeyType: 'next',
                            autoCorrect: true
                        }}
                    />

                    {this.DATA_TYPE_OPTION_BASE_VIEW()}
                </View>
            </DefaultLayout>
        );
    }
}
