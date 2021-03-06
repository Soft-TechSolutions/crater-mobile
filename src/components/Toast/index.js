import React, { Component } from 'react';
import { Text, Animated } from 'react-native';
import { connect } from 'react-redux';
import { styles } from './styles';
import Lng from '@/lang/i18n';

interface IProps {
    reference: any;
    containerStyle: Object;
}

export class ToastComponent extends Component<IProps> {
    constructor() {
        super();
        this.animateOpacityValue = new Animated.Value(0);
        this.state = { message: '' };
    }

    componentDidMount() {
        this.props.reference?.(this);
    }

    componentWillUnmount() {
        this.timerID && clearTimeout(this.timerID);
        this.props.reference?.(undefined);
    }

    show = async (message = '', duration = 1000) => {
        await this.setState({ message });

        Animated.timing(this.animateOpacityValue, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true
        }).start(this.hide(duration));
    };

    hide = duration => {
        this.timerID = setTimeout(() => {
            Animated.timing(this.animateOpacityValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            }).start(() => clearTimeout(this.timerID));
        }, duration);
    };

    render() {
        const { containerStyle, locale } = this.props;

        return (
            <Animated.View
                style={[
                    styles.animatedToastView,
                    { opacity: this.animateOpacityValue },
                    containerStyle && containerStyle
                ]}
            >
                <Text numberOfLines={2} style={styles.title}>
                    {Lng.t(this.state.message, { locale })}
                </Text>
            </Animated.View>
        );
    }
}

const mapStateToProps = ({ global }) => ({
    locale: global?.locale
});

export const Toast = connect(
    mapStateToProps,
    {}
)(ToastComponent);
