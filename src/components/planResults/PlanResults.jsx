var React            = require('react');
var Reflux           = require('reflux');
var ApiConsumerMixin = require('mozaik/browser').Mixin.ApiConsumer;
var PlanResultsList  = require('./PlanResultsList');

var PlanResults = React.createClass({
    mixins: [
        Reflux.ListenerMixin,
        ApiConsumerMixin
    ],

    propTypes: {
        planIds: React.PropTypes.array.isRequired
    },

    getInitialState() {
        return {
            planResults: null,
            overall:{
                state: 0
            }
        };
    },

    getApiRequest() {
        return {
            id: 'bamboo.plan_results',
            params: {
                planIds: this.props.planIds
            }
        };
    },

    onApiData(planResults) {
        var states = planResults.results.map(result => {
            return (result.state !== ('Successful')) ? 2 : 0;
        });
        this.setState({
            planResults: planResults.results
            , baseUrl: planResults.baseUrl
            , overall: {
                state: Math.max.apply(null, states)
            }
        });
    },

    render() {
        var titleNode = (
            <span>
                Bamboo <span className="widget__header__subject">Build Plans</span>
            </span>
        );
        if (this.props.title) {
            titleNode = this.props.title;
        }

        var planResultsListNode = null;
        if (this.state.planResults) {
            planResultsListNode = <PlanResultsList planResults={ this.state.planResults } baseUrl={this.state.baseUrl} />
        }

        return (
            <div>
                <div className="widget__header">
                    { titleNode }
                    <i className="fa fa-eye" />
                </div>
                <div className="widget__body">
                    { planResultsListNode }
                </div>
            </div>
        );
    },

    componentDidUpdate() {
        window.document.querySelector('.widget.bamboo__plan-results').setAttribute('data-state', this.state.overall.state);
    }
});

module.exports = PlanResults;