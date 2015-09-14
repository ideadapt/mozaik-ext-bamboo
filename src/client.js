var request        = require('superagent');
var config         = require('./config');
var Promise        = require('bluebird');
var chalk          = require('chalk');
var cheerio        = require('cheerio');
var AgentFactory   = require('./components/agents/agentFactory');
require('superagent-bluebird-promise');

/**
 * @param {Mozaik} mozaik
 */
var client = function (mozaik) {

    mozaik.loadApiConfig(config);

    function buildRequest(path) {
        var url = config.get('bamboo.baseUrl') + path;

        mozaik.logger.info(chalk.yellow(`[bamboo] fetching from ${ url }`));

        return request.get(url)
            .auth(
                config.get('bamboo.auth.user'),
                config.get('bamboo.auth.password')
            )
            .promise()
            .catch((reason)=>{
                mozaik.logger.error(chalk.red(`[bamboo] request failed: ${JSON.stringify(reason)}`));
            });
    }

    function getAgents(html, agentIds){

        function extractAgents(rowsSelector){
            return $(rowsSelector).map((idx, tr)=>{
                var agent = AgentFactory.createFromRow($(tr));
                if(agentIds.indexOf(agent.id) === -1){
                    return null;
                }
                return agent;
            }).get();
        }

        var $ = cheerio.load(html)
            , onlineAgents = extractAgents('#Onlineremoteagents tr')
            , offlineAgents = extractAgents('#Offlineremoteagents tr')
            , foundAgents = onlineAgents.concat(offlineAgents)
            , foundAgentIds = foundAgents.map((agent)=>{ return agent.id; })
            , absentAgentIds = agentIds.filter((id)=>{ return foundAgentIds.indexOf(id) === -1; });

        if(absentAgentIds.length > 0){
            mozaik.logger.warn(chalk.red(`[bamboo] agent ids not found: ${absentAgentIds.join(', ')}.`));
        }

        return foundAgents;
    }

    return {
        plan_results(parameters) {
            var planIds = parameters.planIds
                , requests = planIds.map((planId)=>{
                    return buildRequest('/rest/api/latest/result/' + planId + '.json?max-result=1')
                });

            return Promise.all(requests)
                .then((responses)=>{
                    return {
                        results: responses.map(function(response) {
                            return response.body.results.result[0];
                        })
                        , baseUrl: config.get('bamboo.baseUrl')
                    };
                }).catch((reason)=>{
                    mozaik.logger.error(chalk.red(`[bamboo] plan_requests failed: ${JSON.stringify(reason)}`));
                });
        }
        , agents(parameters) {
            var agentIds = parameters.agentIds
                , request = buildRequest('/agent/viewAgents.action');

            return request.then((response)=>{
               return {
                results: getAgents(response.text, agentIds)
                , baseUrl: config.get('bamboo.baseUrl')
            };
            }).catch((reason)=>{
                mozaik.logger.error(chalk.red(`[bamboo] agents failed: ${JSON.stringify(reason)}`));
            });
        }
    };
};

module.exports = client;